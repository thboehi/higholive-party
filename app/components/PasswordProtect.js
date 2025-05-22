// filepath: app/components/PasswordProtect.js
"use client";

import { useEffect, useState } from 'react';

export default function PasswordProtect({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (!password) {
      console.error("Le mot de passe administrateur n'est pas défini dans les variables d'environnement (NEXT_PUBLIC_ADMIN_PASSWORD).");
      // Optionnel : afficher un message à l'utilisateur ou bloquer par défaut
      setIsAuthenticated(false); // Ou true si vous voulez bypasser en l'absence de mdp
      return;
    }

    const enteredPassword = prompt("Veuillez entrer le mot de passe pour accéder au site :");
    if (enteredPassword === password) {
      setIsAuthenticated(true);
    } else {
      alert("Mot de passe incorrect.");
      // Vous pouvez rediriger ou afficher un message permanent ici
      // Pour l'instant, cela n'affichera pas les enfants
    }
  }, []);

  if (!isAuthenticated) {
    // Affiche un message pendant que l'authentification n'est pas faite ou si elle a échoué
    // Vous pouvez personnaliser ce message ou le laisser vide pour ne rien afficher
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <p>Accès restreint.</p>
      </div>
    );
  }

  return <>{children}</>;
}