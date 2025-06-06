"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ClickSpark from "../../components/ClickSpark";

export default function Home() {
  const [lastReservationId, setLastReservationId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);
    
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
      sparkColor='#fbbf24'
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    >
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100">
        {/* Hero Section */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <header className="text-center px-4 pt-16 pb-12">
            <div className="animate-bounce mb-6">
              <span className="text-6xl">🎉</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              GRAND ANNIVERSAIRE<br />
              <span className="text-amber-400">DES 30 ANS</span><br />
              DE BEN & LULU !
            </h1>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📍</span>
                <p className="text-lg md:text-xl text-amber-300 font-medium">
                  Chalet bourgeoisial des Flans – Anzère
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📅</span>
                <p className="text-lg md:text-xl text-amber-300 font-medium">
                  Du 9 au 12 octobre 2025
                </p>
              </div>
            </div>
          </header>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <main className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Intro Section */}
            <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 md:p-8 mb-8 border border-gray-700 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mb-4 flex items-center justify-center gap-2">
                  <span>🔥</span>
                  30 ans, ça se fête pas à moitié !
                  <span>🔥</span>
                </h2>
                <p className="text-lg text-gray-200 leading-relaxed">
                  Rejoignez-nous dans notre QG montagnard perché juste sous Anzère pour un anniversaire
                  démesuré, où les rires, la musique et les toasts ne manqueront pas !
                </p>
              </div>
            </section>

            {/* Formules Section */}
            <section className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                ✨ Choisis ta formule ✨
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600 hover:border-amber-500 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">🍾</span>
                    <h4 className="text-xl font-semibold text-amber-400 mb-3">Formule Journée + Soirée</h4>
                    <p className="text-gray-300">Fête jusqu'au bout de la nuit !</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600 hover:border-amber-500 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">🛌</span>
                    <h4 className="text-xl font-semibold text-amber-400 mb-3">Journée + Soirée + Nuit</h4>
                    <p className="text-gray-300">Dormir, c'est mieux que cuver dans la voiture...</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Programme Section */}
            <section className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 md:p-8 mb-8 border border-gray-700`}>
              <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <span>🎶</span>
                Au programme
                <span>🎶</span>
              </h3>
              
              <div className="space-y-4 text-center">
                <p className="text-lg text-gray-200">
                  DJs enflammés le vendredi et samedi soir, vibes festives garanties jusqu'au bout de la nuit !
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  <div className="text-center">
                    <span className="text-3xl block mb-2">🍗</span>
                    <p className="text-sm text-amber-300">Bouffe à gogo</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl block mb-2">🍺</span>
                    <p className="text-sm text-amber-300">Bières fraîches</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl block mb-2">🍷</span>
                    <p className="text-sm text-amber-300">Bon vin</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl block mb-2">🍹</span>
                    <p className="text-sm text-amber-300">Alcools & softs</p>
                  </div>
                </div>
                
                <p className="text-xl font-bold text-amber-400 bg-gray-900 rounded-xl p-4">
                  Tout est INCLUS dans le prix !
                </p>
              </div>
            </section>

            {/* Call to Action Section */}
            <section className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} bg-gradient-to-r from-amber-900 to-orange-900 rounded-3xl p-6 md:p-8 mb-8 border border-amber-600`}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  💃 Amène ta bonne humeur et ta soif de moments inoubliables ! 💃
                </h3>
                <p className="text-lg text-amber-100 mb-4">
                  <span className="font-semibold text-amber-200">🔔 Les places sont limitées,</span> alors réserve vite ta formule !
                </p>
                <p className="text-amber-100">
                  Tu peux réserver autant de jours qu'il te plaît, on sera bien évidemment trop heureux de t'avoir le plus longtemps possible.
                </p>
              </div>
            </section>

            {/* Final Message */}
            <div className={`transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} text-center bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-600`}>
              <p className="text-xl font-semibold text-amber-400">
                On vous promet un week-end mémorable dans les hauteurs, avec l'ambiance des grands soirs et l'amitié en fond de décor. 🌟
              </p>
            </div>
          </main>

          {/* Action Buttons */}
          <div className={`transition-all duration-1000 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col sm:flex-row justify-center items-center gap-4 mb-12`}>
            <Link href="/reserver" legacyBehavior>
              <a className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black py-4 px-8 rounded-2xl font-bold 
                transition-all duration-300 border-2 border-amber-400 hover:border-amber-300
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black
                text-lg text-center w-full sm:w-auto transform hover:scale-105 shadow-lg hover:shadow-amber-500/50">
                🎉 Faire une réservation
              </a>
            </Link>

            {lastReservationId && (
              <Link href="/pay" legacyBehavior>
                <a className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-8 rounded-2xl font-medium 
                  transition-all duration-300 border-2 border-gray-600 hover:border-gray-500
                  focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-500
                  text-lg text-center w-full sm:w-auto transform hover:scale-105">
                  📋 Statut de ma réservation
                </a>
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto p-8 flex gap-6 flex-wrap items-center justify-center opacity-30 hover:opacity-80 transition-all duration-300">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-400 hover:text-amber-300 transition-colors"
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