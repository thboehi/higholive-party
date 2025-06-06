"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ClickSpark from "../../components/ClickSpark";

export default function Home() {
  const [lastReservationId, setLastReservationId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
    
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('lastReservationId');
      if (storedId) {
        setLastReservationId(storedId);
      }
    }
  }, []);

  return (
    <>
      <ClickSpark
        sparkColor='#d4af37'
        sparkSize={8}
        sparkRadius={25}
        sparkCount={12}
        duration={600}
      >
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-slate-100 relative overflow-hidden">
          
          {/* Art Deco Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-amber-400 to-transparent"></div>
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            
            {/* Decorative corners */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-amber-400 rounded-tl-lg"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-amber-400 rounded-tr-lg"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-amber-400 rounded-bl-lg"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-amber-400 rounded-br-lg"></div>
          </div>

          {/* Floating golden particles */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-16 w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-32 left-24 w-1 h-1 bg-amber-300 rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-60 right-32 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse opacity-30" style={{animationDelay: '0.5s'}}></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
            
            {/* Header */}
            <header className={`text-center mb-16 transition-all duration-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Top ornament */}
              <div className="flex justify-center mb-8">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                <div className="mx-4 w-2 h-2 bg-amber-400 rounded-full"></div>
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold text-amber-100 mb-6 leading-tight tracking-wide">
                GRAND ANNIVERSAIRE
                <br />
                <span className="text-amber-400 text-4xl sm:text-5xl lg:text-7xl">30 ANS</span>
                <br />
                <span className="text-2xl sm:text-3xl lg:text-5xl font-light">Ben & Lulu</span>
              </h1>

              {/* Decorative divider */}
              <div className="flex justify-center items-center my-8">
                <div className="w-6 h-px bg-amber-400"></div>
                <div className="mx-3 w-3 h-3 border border-amber-400 rotate-45"></div>
                <div className="w-16 h-px bg-amber-400"></div>
                <div className="mx-3 w-2 h-2 bg-amber-400 rounded-full"></div>
                <div className="w-16 h-px bg-amber-400"></div>
                <div className="mx-3 w-3 h-3 border border-amber-400 rotate-45"></div>
                <div className="w-6 h-px bg-amber-400"></div>
              </div>

              <div className="space-y-4">
                <p className="text-xl sm:text-2xl text-amber-200 font-light tracking-widest">
                  CHALET BOURGEOISIAL DES FLANS
                </p>
                <p className="text-lg sm:text-xl text-slate-300 font-light">
                  Anzère
                </p>
                <p className="text-lg sm:text-xl text-slate-300 font-light">
                  9 - 12 Octobre 2025
                </p>
              </div>

              {/* Discrete reservation button */}
              <div className={`mt-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Link href="/reserver" legacyBehavior>
                  <a className="inline-block border border-amber-400/50 hover:border-amber-400 
                    text-amber-300 hover:text-amber-200 
                    px-8 py-3 font-light tracking-widest text-sm
                    transition-all duration-300 
                    hover:bg-amber-400/10 hover:shadow-lg hover:shadow-amber-400/20
                    relative overflow-hidden group">
                    <span className="relative z-10">RÉSERVER</span>
                    <div className="absolute inset-0 bg-amber-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </a>
                </Link>
              </div>
            </header>

            {/* Main content sections */}
            <main className="space-y-12">
              
              {/* Welcome section */}
              <section className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="border border-amber-400/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 sm:p-12">
                  
                  {/* Section ornament */}
                  <div className="flex justify-center mb-8">
                    <div className="w-8 h-px bg-amber-400"></div>
                    <div className="mx-2 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    <div className="w-8 h-px bg-amber-400"></div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif text-center text-amber-400 mb-8 tracking-wide">
                    Une Célébration Extraordinaire
                  </h2>
                  
                  <p className="text-lg text-slate-200 leading-relaxed text-center font-light">
                    Nous vous invitons à nous rejoindre dans notre demeure montagnarde pour célébrer trois décennies 
                    d'existence dans un cadre d'exception. Une soirée où l'élégance rencontre la festivité, 
                    où chaque moment sera gravé dans la mémoire collective.
                  </p>
                </div>
              </section>

              {/* Formulas section */}
              <section className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="text-center mb-10">
                  <h3 className="text-2xl sm:text-3xl font-serif text-amber-400 mb-4">Formules Proposées</h3>
                  <div className="flex justify-center">
                    <div className="w-24 h-px bg-amber-400"></div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="border border-amber-400/40 bg-slate-800/30 p-8 hover:border-amber-400/60 transition-all duration-300 hover:bg-slate-800/50 group">
                    <div className="text-center">
                      <div className="w-12 h-12 border border-amber-400 mx-auto mb-4 flex items-center justify-center">
                        <div className="w-6 h-6 bg-amber-400/20"></div>
                      </div>
                      <h4 className="text-xl font-serif text-amber-300 mb-4">Soirée Exclusive</h4>
                      <p className="text-slate-300 font-light leading-relaxed">
                        Journée et soirée dans l'atmosphère raffinée de notre événement privé
                      </p>
                    </div>
                  </div>

                  <div className="border border-amber-400/40 bg-slate-800/30 p-8 hover:border-amber-400/60 transition-all duration-300 hover:bg-slate-800/50 group">
                    <div className="text-center">
                      <div className="w-12 h-12 border border-amber-400 mx-auto mb-4 flex items-center justify-center">
                        <div className="w-6 h-6 bg-amber-400/30"></div>
                      </div>
                      <h4 className="text-xl font-serif text-amber-300 mb-4">Séjour Complet</h4>
                      <p className="text-slate-300 font-light leading-relaxed">
                        Soirée exclusive avec hébergement dans nos appartements privés
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Program section */}
              <section className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="border border-amber-400/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 sm:p-12">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl sm:text-3xl font-serif text-amber-400 mb-4">Programme de la Soirée</h3>
                    <div className="flex justify-center">
                      <div className="w-24 h-px bg-amber-400"></div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-amber-400 text-xl">♪</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">Musique Live</h4>
                      <p className="text-slate-400 text-sm font-light">DJs renommés</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-amber-400 text-xl">✦</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">Gastronomie</h4>
                      <p className="text-slate-400 text-sm font-light">Mets raffinés</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-amber-400 text-xl">◊</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">Spiritueux</h4>
                      <p className="text-slate-400 text-sm font-light">Sélection premium</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-amber-400 text-xl">✧</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">Ambiance</h4>
                      <p className="text-slate-400 text-sm font-light">Élégance assurée</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xl text-amber-300 font-serif border border-amber-400/30 bg-slate-900/50 p-6 inline-block">
                      Tous les plaisirs sont inclus
                    </p>
                  </div>
                </div>
              </section>

              {/* Call to action */}
              <section className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="border border-amber-400/50 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 p-8 sm:p-12 text-center">
                  <h3 className="text-2xl sm:text-3xl font-serif text-amber-200 mb-6">
                    Une Invitation Exclusive
                  </h3>
                  <p className="text-lg text-amber-100 mb-6 font-light leading-relaxed">
                    Les places étant limitées, nous vous invitons à confirmer votre présence dans les plus brefs délais. 
                    Joignez-vous à nous pour cette célébration mémorable dans un cadre d'exception.
                  </p>
                  <div className="flex justify-center">
                    <div className="w-32 h-px bg-amber-400"></div>
                  </div>
                </div>
              </section>

              {/* Final message */}
              <div className={`transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} text-center border border-amber-400/20 bg-slate-800/30 p-8`}>
                <p className="text-xl font-serif text-amber-300 italic">
                  "Un week-end d'exception vous attend dans les hauteurs, 
                  où l'amitié et la célébration se rencontrent dans un cadre sublime."
                </p>
              </div>
            </main>

            {/* Action buttons */}
            <div className={`transition-all duration-1000 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col sm:flex-row justify-center items-center gap-6 mt-16 mb-12`}>
              <Link href="/reserver" legacyBehavior>
                <a className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 
                  text-black py-4 px-12 font-serif font-medium text-lg tracking-widest
                  transition-all duration-300 
                  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900
                  text-center w-full sm:w-auto transform hover:scale-105 shadow-lg hover:shadow-amber-500/30
                  border border-amber-500">
                  RÉSERVER MAINTENANT
                </a>
              </Link>

              {lastReservationId && (
                <Link href="/pay" legacyBehavior>
                  <a className="border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 
                    py-4 px-12 font-serif font-light text-lg tracking-widest
                    transition-all duration-300 hover:bg-amber-400/10
                    text-center w-full sm:w-auto transform hover:scale-105">
                    STATUT RÉSERVATION
                  </a>
                </Link>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-amber-400/20 mt-auto p-8 flex gap-6 flex-wrap items-center justify-center opacity-40 hover:opacity-80 transition-all duration-300 relative z-10">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-slate-400 hover:text-amber-300 transition-colors font-light"
              href="https://thbo.ch/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                className="opacity-60"
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
    </>
  );
}