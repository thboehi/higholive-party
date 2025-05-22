import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Configuration MongoDB (identique à la route principale)
const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || 'higholive-party';

// GET - Récupérer une réservation par son reservationId
export async function GET(request, { params }) {
  let client = null;
  try {
    const { id } = params; // Récupère l'ID de la réservation depuis les paramètres de l'URL

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