import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken'; // Importer jsonwebtoken
import { cookies } from 'next/headers'; // Importer cookies

// Configuration MongoDB (identique à la route principale)
const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || 'higholive-party';
const JWT_SECRET = process.env.JWT_SECRET; // Récupérer la clé secrète JWT

// Fonction pour recalculer le prix original d'une réservation
function calculateOriginalPrice(reservation) {
  let total = 0;
  
  if (reservation.pass2Days && reservation.pass2Days.selected) {
    // Prix pour pass 2 jours = 90 CHF par personne
    total = reservation.numberOfPeople * 90;
  } else {
    // Calculer selon les options individuelles
    reservation.reservations.forEach(dayReservation => {
      if (dayReservation.option === "jourEtSoir") {
        total += reservation.numberOfPeople * 45;
      } else if (dayReservation.option === "jourSoirEtNuit") {
        total += reservation.numberOfPeople * 55;
      }
    });
  }
  
  return total;
}

// GET - Récupérer une réservation par son reservationId
export async function GET(request, { params }) {
  let client = null;
  try {
    const { id } = await params; // Récupère l'ID de la réservation depuis les paramètres de l'URL

    if (!id) {
      return NextResponse.json({ success: false, message: "L'identifiant de la réservation est manquant." }, { status: 400 });
    }

    // Se connecter à MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Rechercher la réservation par reservationId
    // Note: Dans votre schéma, l'identifiant unique est stocké dans le champ 'reservationId'
    const reservation = await db.collection('reservations').findOne({ reservationId: id });

    if (!reservation) {
      return NextResponse.json({ success: false, message: "Aucune réservation trouvée avec cet identifiant." }, { status: 404 });
    }

    // Renvoyer la réservation trouvée
    return NextResponse.json({ success: true, data: reservation });

  } catch (error) {
    console.error('Erreur API (GET /[id]):', error);
    return NextResponse.json({ success: false, message: "Une erreur s'est produite lors de la récupération de la réservation." }, { status: 500 });
  } finally {
    // S'assurer que la connexion MongoDB est fermée même en cas d'erreur
    if (client) {
      await client.close().catch(err => console.error('Erreur lors de la fermeture de la connexion MongoDB (GET /[id]):', err));
    }
  }
}

// PUT - Modifier le statut d'une réservation par son reservationId
export async function PUT(request, { params }) {
  let client = null;
  try {
    // Vérification du token JWT
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET n'est pas défini pour l'API PUT /api/[id].");
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
    // Fin de la vérification du token JWT

    const { id } = await params; // Récupère l'ID de la réservation depuis les paramètres de l'URL
    const body = await request.json(); // Récupère le corps de la requête
    const { status, isInvited } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "L'identifiant de la réservation est manquant." }, { status: 400 });
    }

    // Validation du statut si fourni
    if (status) {
      const allowedStatus = ["pending", "paid", "deleted"];
      if (!allowedStatus.includes(status)) {
        return NextResponse.json({ success: false, message: `Statut invalide. Les statuts autorisés sont : ${allowedStatus.join(', ')}.` }, { status: 400 });
      }
    }

    // Se connecter à MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Construire l'objet de mise à jour
    const updateObj = {};
    
    if (status) {
      updateObj.status = status;
    }
    
    // Gestion des invités
    if (isInvited === true) {
      updateObj.isInvited = true;
      updateObj.totalPrice = 0; // Prix à 0 pour les invités
      updateObj.status = 'paid'; // Statut payé automatiquement pour les invités
    }
    
    // Si on remet en pending et que c'était un invité, recalculer le prix
    if (status === 'pending' && isInvited !== true) {
      // Récupérer d'abord la réservation pour vérifier si c'était un invité
      const existingReservation = await db.collection('reservations').findOne({ reservationId: id });
      if (existingReservation && existingReservation.isInvited) {
        // Recalculer le prix original
        const originalPrice = calculateOriginalPrice(existingReservation);
        updateObj.totalPrice = originalPrice;
        updateObj.isInvited = false;
      }
    }

    // Vérifier qu'il y a quelque chose à mettre à jour
    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json({ success: false, message: "Aucune modification à effectuer." }, { status: 400 });
    }

    // Mettre à jour la réservation
    const result = await db.collection('reservations').updateOne(
      { reservationId: id },
      { $set: updateObj }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Aucune réservation trouvée avec cet identifiant." }, { status: 404 });
    }

    // Récupérer la réservation mise à jour pour la retourner
    const updatedReservation = await db.collection('reservations').findOne({ reservationId: id });

    return NextResponse.json({ 
      success: true, 
      message: "Réservation mise à jour avec succès.",
      data: updatedReservation 
    });

  } catch (error) {
    console.error('Erreur API (PUT /[id]):', error);
    if (error instanceof SyntaxError) { // Erreur de parsing JSON
        return NextResponse.json({ success: false, message: "Corps de la requête JSON invalide." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Une erreur s'est produite lors de la mise à jour de la réservation." }, { status: 500 });
  } finally {
    // S'assurer que la connexion MongoDB est fermée même en cas d'erreur
    if (client) {
      await client.close().catch(err => console.error('Erreur lors de la fermeture de la connexion MongoDB (PUT /[id]):', err));
    }
  }
}