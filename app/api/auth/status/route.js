// filepath: /Users/thoma/Documents/Clients/High Olive/higholive-party/app/api/auth/status/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!JWT_SECRET) {
    console.error("JWT_SECRET n'est pas défini.");
    return NextResponse.json({ isAuthenticated: false, message: "Erreur de configuration serveur." }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ isAuthenticated: true });
  } catch (error) {
    // Token invalide ou expiré
    return NextResponse.json({ isAuthenticated: false });
  }
}