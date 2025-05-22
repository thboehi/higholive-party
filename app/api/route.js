import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Configuration MongoDB
const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || 'higholive-party';
const n8nEndpoint = process.env.N8N_ENDPOINT;

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
      if (!person.firstName?.trim()) {
        errors.push(`Le prénom de la personne ${index + 2} est requis`);
      }
      if (!person.lastName?.trim()) {
        errors.push(`Le nom de famille de la personne ${index + 2} est requis`);
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
      return [0, 1, 2]; // Tous les jours
    }
    
    switch (formData.pass2Days.daysSelection) {
      case "jeudiVendredi":
        return [0, 1]; // Jeudi et Vendredi
      case "vendrediSamedi":
        return [1, 2]; // Vendredi et Samedi
      case "jeudiSamedi":
        return [0, 2]; // Jeudi et Samedi
      default:
        return []; // Aucun jour sélectionné encore
    }
  };
  
  // Valider les réservations quotidiennes
  if (!formData.pass2Days.selected) {
    // Au moins une réservation doit être sélectionnée
    const hasAnyReservation = formData.reservations.some(res => res.option);
    if (!hasAnyReservation) {
      errors.push("Veuillez sélectionner au moins une option de réservation pour un jour");
    }
    
    // Chaque jour sélectionné doit avoir une option de repas
    formData.reservations.forEach((res, index) => {
      if (res.option && !res.mealOption) {
        errors.push(`Veuillez sélectionner une option de repas pour ${res.day}`);
      }
    });
  } else {
    // Si pass 2 jours sélectionné, vérifier que les options de repas sont choisies
    const selectedDays = daysToDisplay();
    selectedDays.forEach(dayIndex => {
      if (!formData.reservations[dayIndex].mealOption) {
        errors.push(`Veuillez sélectionner une option de repas pour ${formData.reservations[dayIndex].day}`);
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
      return NextResponse.json({ 
        success: false, 
        errors: validationErrors 
      }, { status: 400 });
    }
    
    // Créer un ID unique pour la réservation
    const reservationId = new Date().getTime().toString(36) + Math.random().toString(36).substring(2, 9);
    
    // Ajouter des métadonnées à la réservation
    const reservation = {
      ...formData,
      createdAt: new Date().toISOString(),
      status: "pending", // pending, paid, cancelled
      reservationId,
    };
    
    // Préparer les données pour n8n
    const n8nData = {
      reservation: {
        ...reservation
      }
    };
    
    // Vérifier que l'endpoint n8n est configuré
    if (!n8nEndpoint) {
      console.error("N8N_ENDPOINT n'est pas défini dans les variables d'environnement");
      return NextResponse.json({ 
        success: false, 
        message: "Configuration du système incomplète. Veuillez contacter l'administrateur." 
      }, { status: 500 });
    }
    
    // Envoyer les données à n8n AVANT d'insérer dans MongoDB
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nData),
    });
    
    if (!n8nResponse.ok) {
      const errorData = await n8nResponse.text();
      console.error(`Erreur n8n: ${n8nResponse.status} - ${errorData}`);
      return NextResponse.json({ 
        success: false, 
        message: "Impossible de finaliser la réservation. Veuillez réessayer ultérieurement." 
      }, { status: 502 }); // Bad Gateway
    }
    
    // N8N a bien reçu les données, maintenant on peut insérer dans MongoDB
    
    // Se connecter à MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    
    // Insérer la réservation dans la base de données
    await db.collection('reservations').insertOne(reservation);
    
    // Fermer la connexion MongoDB
    await client.close();
    client = null;
    
    // Renvoyer une réponse réussie
    return NextResponse.json({ 
      success: true, 
      message: "Réservation enregistrée avec succès",
      reservationId: reservationId
    });
    
  } catch (error) {
    console.error('Erreur API:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Une erreur s'est produite lors du traitement de votre réservation" 
    }, { status: 500 });
  } finally {
    // S'assurer que la connexion MongoDB est fermée même en cas d'erreur
    if (client) {
      await client.close().catch(console.error);
    }
  }
}