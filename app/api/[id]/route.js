import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken'; // Importer jsonwebtoken
import { cookies } from 'next/headers'; // Importer cookies

// Configuration MongoDB (identique à la route principale)
const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || 'higholive-party';
const JWT_SECRET = process.env.JWT_SECRET; // Récupérer la clé secrète JWT

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

    const { id } = params; // Récupère l'ID de la réservation depuis les paramètres de l'URL
    const { status } = await request.json(); // Récupère le nouveau statut depuis le corps de la requête

    if (!id) {
      return NextResponse.json({ success: false, message: "L'identifiant de la réservation est manquant." }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ success: false, message: "Le nouveau statut est manquant." }, { status: 400 });
    }

    const allowedStatus = ["pending", "paid", "deleted"];
    if (!allowedStatus.includes(status)) {
      return NextResponse.json({ success: false, message: `Statut invalide. Les statuts autorisés sont : ${allowedStatus.join(', ')}.` }, { status: 400 });
    }

    // Se connecter à MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Mettre à jour le statut de la réservation
    const result = await db.collection('reservations').updateOne(
      { reservationId: id },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Aucune réservation trouvée avec cet identifiant." }, { status: 404 });
    }

    if (result.modifiedCount === 0 && result.matchedCount > 0) { // Vérifier aussi matchedCount pour éviter une réponse trompeuse si l'ID est bon mais le statut est déjà le même
      return NextResponse.json({ success: true, message: "Le statut de la réservation n'a pas été modifié (peut-être était-il déjà à jour)." });
    }

    // Renvoyer une réponse de succès
    return NextResponse.json({ success: true, message: "Statut de la réservation mis à jour avec succès." });

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