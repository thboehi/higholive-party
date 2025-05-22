import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PasswordProtect from "./components/PasswordProtect"; // Importer le composant

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Party - HighOlive",
  description: "Prochainement ...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PasswordProtect>
          {children}
        </PasswordProtect>
      </body>
    </html>
  );
}
