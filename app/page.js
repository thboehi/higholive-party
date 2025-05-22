"use client"
import Image from "next/image";
import Link from "next/link"; // Importer Link pour la navigation
import { useEffect, useState } from "react"; // Importer useEffect et useState
import ClickSpark from "./components/ClickSpark";

export default function Home() {
  const [lastReservationId, setLastReservationId] = useState(null);

  useEffect(() => {
    // Accéder au localStorage uniquement côté client
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('lastReservationId');
      if (storedId) {
        setLastReservationId(storedId);
      }
    }
  }, []);

  return (
    <ClickSpark
      sparkColor='#555' // Couleur des étincelles neutre
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen bg-black text-gray-300 py-12 pb-24 flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 w-full">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🎉 GRAND ANNIVERSAIRE DES 30 ANS DE BEN & LULU ! 🎉
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-semibold"> {/* Couleur modifiée */}
              📍 Chalet bourgeoisial des Flans – Anzère
            </p>
            <p className="text-lg md:text-xl text-gray-400"> {/* Couleur modifiée */}
              📅 Du 9 au 12 octobre 2025
            </p>
          </header>

          <main className="bg-[#111] rounded-2xl p-6 md:p-10 shadow-2xl border border-[#222] text-lg">
            <p className="text-center text-2xl font-bold text-white mb-8"> {/* Couleur modifiée */}
              🔥 30 ans, ça se fête pas à moitié… alors on vous a préparé un week-end de FOLIE ! 🔥
            </p>
            <p className="mb-6">
              Rejoignez-nous dans notre QG montagnard perché juste sous Anzère pour un anniversaire
              démesuré, où les rires, la musique et les toasts ne manqueront pas !
            </p>
            <p className="mb-6">
              Deux options s’offrent à vous :
            </p>
            <ul className="list-disc list-inside mb-6 pl-4 space-y-2">
              <li>
                <span className="font-semibold text-gray-200">🍾 Formule Journée + Soirée</span> {/* Couleur modifiée */}
              </li>
              <li>
                <span className="font-semibold text-gray-200">🛌 Formule Journée + Soirée + Nuit en chambre</span> (parce que dormir, c’est mieux que cuver dans la voiture…) {/* Couleur modifiée */}
              </li>
            </ul>
            <p className="mb-6">
              <span className="font-semibold text-white">🎶 Au programme :</span> DJs enflammés le vendredi et samedi soir, vibes festives garanties jusqu’au bout de la nuit ! {/* Couleur modifiée */}
            </p>
            <p className="mb-6">
              <span className="font-semibold text-white">🍗 Bouffe à gogo, 🍺 bières fraîches, 🍷 bon vin, 🍹 sélection d’alcools forts et 🥤 softs</span> pour les plus sages... tout est <span className="font-bold text-white">INCLUS</span> dans le prix. {/* Couleur modifiée */}
            </p>
            <p className="mb-6">
              💃 Amène ta bonne humeur, ta dégaine de fête et ta soif de moments inoubliables !
            </p>
            <p className="mb-8">
              <span className="font-semibold text-white">🔔 Les places sont limitées,</span> alors réserve vite ta formule et viens souffler nos 30 bougies comme il se doit ! Tu peux réserver autant de jours qu’il te plaît, on sera bien évidemment trop heureux de t’avoir le plus longtemps possible. {/* Couleur modifiée */}
            </p>
            <p className="text-center text-xl font-semibold text-white mt-8">
              On vous promet un week-end mémorable dans les hauteurs, avec l’ambiance des grands soirs et l’amitié en fond de décor. 🌟
            </p>
          </main>

          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link href="/reserver" legacyBehavior>
              <a className="bg-white hover:bg-gray-200 text-zinc-900 py-3 px-8 rounded-xl font-medium 
                transition duration-300 border border-gray-400 hover:border-gray-500
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black
                text-lg text-center w-full sm:w-auto"> {/* Style aligné sur le bouton "Statut", version blanche */}
                Faire une réservation
              </a>
            </Link>

            {lastReservationId && (
              <Link href="/pay" legacyBehavior>
                <a className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-xl font-medium 
                  transition duration-300 border border-gray-600 hover:border-gray-500
                  focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-500
                  text-lg text-center w-full sm:w-auto">
                  Statut de ma dernière réservation
                </a>
              </Link>
            )}
          </div>
        </div>

        <footer className="mt-auto pt-12 flex gap-[24px] flex-wrap items-center justify-center opacity-20 hover:opacity-100 transition-opacity">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-400 hover:text-gray-200"
            href="https://thbo.ch/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              className="dark:invert"
              src="/pen-tool.svg"
              alt="Pen Tool icon"
              width={16}
              height={16}
            />
            thbo.ch
          </a>
        </footer>
      </div>
    </ClickSpark>
  );
}
