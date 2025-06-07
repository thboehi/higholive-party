import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://party.higholive.ch"; // Remplacez par l'URL de votre site déployé
const siteTitle = "🎉 Party - 30 ANS BEN & LULU 🎉";
const siteDescription = "Rejoignez-nous pour fêter nos 30 ans au Chalet bourgeoisial des Flans à Anzère du 9 au 12 octobre 2025 ! Réservations ouvertes.";
const siteImage = `${siteUrl}/og-image.png`;

export const metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: "Party Ben & Lulu",
  authors: [{ name: "thbo.ch" }], // Ou le nom du développeur/organisateur
  keywords: ["anniversaire", "Ben & Lulu", "30 ans", "fête", "Anzère", "chalet", "party", "réservation", "benoit", "lucien", "thbo.ch", "boehi", "junot", "benoit junot", "lucien boehi"],
  
  // Open Graph Metadata
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: siteImage, // URL de votre image pour l'aperçu
        width: 1200, // Largeur recommandée pour OG
        height: 630, // Hauteur recommandée pour OG
        alt: "Invitation Anniversaire 30 ans Ben & Lulu",
      },
    ],
    locale: "fr_CH", // Ou fr_FR, selon votre public principal
    siteName: siteTitle,
  },

  // Twitter Card Metadata (optionnel, mais recommandé)
  twitter: {
    card: "summary_large_image", // Type de carte Twitter
    title: siteTitle,
    description: siteDescription,
    images: [siteImage], // URL de votre image pour Twitter
    // creator: "@votrenomtwitter", // Si vous avez un compte Twitter associé
  },

  // Pour un meilleur contrôle sur les robots d'indexation (optionnel)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Favicons et icônes (assurez-vous que ces fichiers existent dans votre dossier public)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png", // ou /favicon.ico
    apple: "/apple-touch-icon.png",
    // autres tailles si nécessaire
  },
  other: {
    'theme-color': '#000',
    'color-scheme': 'dark',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': '30 ANS BEN & LULU',
    'application-name': '30 ANS BEN & LULU',
    'msapplication-TileColor': '#d4af37',
    'msapplication-config': '/browserconfig.xml',
  },
  
  // Manifest pour PWA (si applicable)
  // manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
