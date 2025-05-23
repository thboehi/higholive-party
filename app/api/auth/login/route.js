// filepath: /Users/thoma/Documents/Clients/High Olive/higholive-party/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!ADMIN_PASSWORD || !JWT_SECRET) {
      console.error("Les variables d'environnement ADMIN_PASSWORD ou JWT_SECRET ne sont pas définies.");
      return NextResponse.json({ success: false, message: "Erreur de configuration serveur." }, { status: 500 });
    }

    if (password === ADMIN_PASSWORD) {
      // Générer un token JWT
      const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '1h' }); // Token valide pour 1 heure
      
      const response = NextResponse.json({ success: true, message: "Connexion réussie." });
      // Stocker le token dans un cookie HttpOnly pour plus de sécurité
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // true en production
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60, // 1 heure en secondes
      });
      return response;

    } else {
      return NextResponse.json({ success: false, message: "Mot de passe incorrect." }, { status: 401 });
    }
  } catch (error) {
    console.error('Erreur API (POST /auth/login):', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, message: "Corps de la requête JSON invalide." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Une erreur s'est produite lors de la tentative de connexion." }, { status: 500 });
  }
}