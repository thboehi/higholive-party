import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // Import cookies

// Configuration MongoDB
const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || 'higholive-party';
const n8nEndpoint = process.env.N8N_ENDPOINT;
const JWT_SECRET = process.env.JWT_SECRET;

// Fonction pour valider les données
function validateFormData(formData) {
  const errors = [];
  
  // Valider le contact principal
  const { firstName, lastName, address, town, email } = formData.mainContact;
  if (!firstName?.trim()) errors.push("Le prénom du contact principal est requis");
  if (!lastName?.trim()) errors.push("Le nom de famille du contact principal est requis");
  if (!address?.trim()) errors.push("L'adresse du contact principal est requise");
  if (!town?.trim()) errors.push("La ville du contact principal est requise");
  if (!email?.trim()) errors.push("L'email du contact principal est requis");
  if (email?.trim() && !email.includes('@')) errors.push("L'email doit être valide");
  
  // Valider les personnes supplémentaires
  if (formData.numberOfPeople > 1) {
    formData.additionalPeople.forEach((person, index) => {
        if (!person.firstName?.trim() || !person.lastName?.trim()) {
            errors.push(`Le prénom et le nom de la personne supplémentaire ${index + 1} sont requis`);
        }
    });
  }
  
  // Valider le pass 2 jours si sélectionné
  if (formData.pass2Days.selected && !formData.pass2Days.daysSelection) {
    errors.push("Veuillez sélectionner quels jours pour le pass 2 jours");
  }
  
  // Fonction auxiliaire pour déterminer les jours à afficher
  const daysToDisplay = () => {
    if (!formData.pass2Days.selected) {
        // Retourne les index des jours où une option est sélectionnée
        return formData.reservations.map((res, index) => res.option ? index : -1).filter(index => index !== -1);
    }
    
    switch (formData.pass2Days.daysSelection) {
      case "jeudiVendredi": return [0, 1];
      case "vendrediSamedi": return [1, 2];
      case "jeudiSamedi": return [0, 2];
      default: return [];
    }
  };
  
  // Valider les réservations quotidiennes
  if (!formData.pass2Days.selected) {
    // Au moins une réservation doit être sélectionnée
    const hasAnyReservation = formData.reservations.some(res => res.option);
    if (!hasAnyReservation) {
        errors.push("Veuillez sélectionner au moins une option de réservation pour un jour.");
    }
    
    // Chaque jour sélectionné doit avoir une option de repas
    formData.reservations.forEach((res, index) => {
        if (res.option && !res.mealOption) {
            errors.push(`Veuillez sélectionner une option de repas pour ${res.day.split(" - ")[0]}`);
        }
    });
  } else {
    // Si pass 2 jours sélectionné, vérifier que les options de repas sont choisies
    const selectedDaysIndexes = daysToDisplay();
    selectedDaysIndexes.forEach(dayIndex => {
        if (!formData.reservations[dayIndex].mealOption) {
            errors.push(`Veuillez sélectionner une option de repas pour ${formData.reservations[dayIndex].day.split(" - ")[0]} (Pass 2 jours)`);
        }
    });
  }
  
  // Vérifier que le prix total n'est pas 0
  if (formData.totalPrice <= 0) {
    errors.push("Aucune option n'a été sélectionnée, impossible de procéder au paiement");
  }
  
  return errors;
}

// POST - Traiter une nouvelle réservation
export async function POST(request) {
  let client = null;
  
  try {
    // Récupérer les données de la requête
    const formData = await request.json();
    
    // Valider les données
    const validationErrors = validateFormData(formData);
    
    if (validationErrors.length > 0) {
      return NextResponse.json({ success: false, message: "Erreurs de validation.", errors: validationErrors }, { status: 400 });
    }
    
    // Créer un ID unique pour la réservation
    const reservationId = new Date().getTime().toString(36) + Math.random().toString(36).substring(2, 9);
    
    // Ajouter des métadonnées à la réservation
    const reservation = {
      ...formData,
      createdAt: new Date().toISOString(),
      status: "pending", // Statut initial
      reservationId,
    };
    
    // Préparer les données pour n8n
    const n8nData = {
      ...reservation,
      paymentLink: `${request.nextUrl.origin}/pay?reservationId=${reservationId}`
    };

    // Se connecter à MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    
    // Insérer la réservation dans la base de données
    await db.collection('reservations').insertOne(reservation);
    
    // Envoyer les données à n8n (de manière asynchrone, ne pas bloquer la réponse)
    if (n8nEndpoint) {
      fetch(n8nEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nData),
      }).catch(err => console.error("Erreur lors de l'envoi à n8n:", err));
    }
    
    // Renvoyer une réponse de succès avec l'ID de réservation
    return NextResponse.json({ success: true, message: "Réservation créée avec succès!", reservationId: reservationId, data: reservation });
    
  } catch (error) {
    console.error('Erreur API (POST):', error);
    if (error instanceof SyntaxError) { // Erreur de parsing JSON
        return NextResponse.json({ success: false, message: "Corps de la requête JSON invalide." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Une erreur s'est produite lors de la création de la réservation." }, { status: 500 });
  } finally {
    // S'assurer que la connexion MongoDB est fermée même en cas d'erreur
    if (client) {
      await client.close().catch(err => console.error('Erreur lors de la fermeture de la connexion MongoDB (POST):', err));
    }
  }
}

// GET - Récupérer toutes les réservations (sécurisé par token JWT via cookie)
export async function GET(request) {
  let client = null;
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET n'est pas défini pour l'API GET /api.");
      return NextResponse.json({ success: false, message: "Erreur de configuration serveur." }, { status: 500 });
    }

    if (!token) {
      return NextResponse.json({ success: false, message: "Accès non autorisé. Token manquant." }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET); // Vérifie le token
    } catch (e) {
      return NextResponse.json({ success: false, message: "Accès non autorisé. Token invalide ou expiré." }, { status: 403 });
    }

    // Si le token est valide, continuer pour récupérer les données
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const reservations = await db.collection('reservations').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ success: true, data: reservations });

  } catch (error) {
    console.error('Erreur API (GET):', error);
    return NextResponse.json({ success: false, message: "Une erreur s'est produite lors de la récupération des réservations." }, { status: 500 });
  } finally {
    if (client) {
      await client.close().catch(err => console.error('Erreur lors de la fermeture de la connexion MongoDB (GET):', err));
    }
  }
}

