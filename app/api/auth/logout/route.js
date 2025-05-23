// filepath: /Users/thoma/Documents/Clients/High Olive/higholive-party/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const response = NextResponse.json({ success: true, message: "Déconnexion réussie." });
    // Supprimer le cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: -1, // Expire immédiatement
    });
    return response;
  } catch (error) {
    console.error('Erreur API (POST /auth/logout):', error);
    return NextResponse.json({ success: false, message: "Une erreur s'est produite lors de la déconnexion." }, { status: 500 });
  }
}