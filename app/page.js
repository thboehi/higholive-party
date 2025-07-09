"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClickSpark from "./components/ClickSpark";

// Enregistrer le plugin ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [lastReservationId, setLastReservationId] = useState(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const headerRef = useRef(null);
  const sectionsRef = useRef([]);
  const particlesRef = useRef(null);
  const ornamentRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('lastReservationId');
      if (storedId) {
        setLastReservationId(storedId);
      }
    }

    // Timeline principale pour l'entrée
    const tl = gsap.timeline();
    
    // Animation d'entrée du header
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: 100, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "power3.out" }
    )
    .fromTo(ornamentRef.current.children,
      { opacity: 0, scale: 0, rotation: -180 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
      "-=1"
    )
    // Animation spécifique pour les textes du titre (pas les ornements)
    .fromTo(titleRef.current.querySelectorAll('.title-text'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" },
      "-=0.5"
    );

    // Animations pour les sections au scroll
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(section,
          { opacity: 0, y: 100, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Animation des éléments internes
        const internalElements = section.querySelectorAll('h2, h3, p, div[class*="border"]');
        gsap.fromTo(internalElements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    // Animation continue des particules
    const animateParticles = () => {
      const particles = particlesRef.current?.children;
      if (particles) {
        Array.from(particles).forEach((particle, index) => {
          gsap.to(particle, {
            y: `random(-20, -100)`,
            x: `random(-50, 50)`,
            rotation: `random(0, 360)`,
            opacity: `random(0.3, 1)`,
            duration: `random(3, 8)`,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * 0.2
          });
        });
      }
    };

    // Démarrer l'animation des particules après un délai
    setTimeout(animateParticles, 1000);

    // Animation de hover pour les éléments interactifs
    const buttons = document.querySelectorAll('a[class*="border"], a[class*="bg-gradient"]');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      });
      button.addEventListener('mouseleave', () => {
        gsap.to(button, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    });

    // Animation des ornements en continu
    gsap.to(".floating-ornament:not(.corner-ornament)", {
      rotation: 360,
      duration: 20,
      ease: "none",
      repeat: -1
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
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
        <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-slate-100 relative overflow-hidden">
          
          {/* Enhanced Art Deco Background Pattern avec parallaxe */}
          <div className="absolute inset-0 opacity-15 parallax-bg">
           
            
            {/* Enhanced decorative corners avec animations */}
            <div className="absolute top-6 left-6 w-20 h-20 floating-ornament corner-ornament">
              <div className="absolute inset-0 border-l-2 border-t-2 border-amber-400 rounded-tl-lg"></div>
              <div className="absolute inset-2 border-l border-t border-amber-300 rounded-tl-lg"></div>
              <div className="absolute top-4 left-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute top-6 right-6 w-20 h-20 floating-ornament corner-ornament">
              <div className="absolute inset-0 border-r-2 border-t-2 border-amber-400 rounded-tr-lg"></div>
              <div className="absolute inset-2 border-r border-t border-amber-300 rounded-tr-lg"></div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-28 left-6 w-20 h-20 floating-ornament corner-ornament">
              <div className="absolute inset-0 border-l-2 border-b-2 border-amber-400 rounded-bl-lg"></div>
              <div className="absolute inset-2 border-l border-b border-amber-300 rounded-bl-lg"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-28 right-6 w-20 h-20 floating-ornament corner-ornament">
              <div className="absolute inset-0 border-r-2 border-b-2 border-amber-400 rounded-br-lg"></div>
              <div className="absolute inset-2 border-r border-b border-amber-300 rounded-br-lg"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </div>

            {/* Additional geometric patterns */}
            <div className="absolute top-1/4 left-16 floating-ornament">
              <div className="w-8 h-8 border border-amber-400/30 rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-amber-400/20"></div>
              </div>
            </div>
            <div className="absolute top-3/4 right-16 floating-ornament">
              <div className="w-8 h-8 border border-amber-400/30 rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-amber-400/20"></div>
              </div>
            </div>
          </div>

          {/* Advanced floating golden particles */}
          <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
            {/* Particules principales */}
            <div className="absolute top-20 left-16 w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-70"></div>
            <div className="absolute top-40 right-20 w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full opacity-50"></div>
            <div className="absolute bottom-32 left-24 w-1.5 h-1.5 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-60 right-32 w-2.5 h-2.5 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full opacity-40"></div>
            <div className="absolute top-32 left-1/3 w-1 h-1 bg-amber-500 rounded-full opacity-50"></div>
            <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-yellow-500 rounded-full opacity-60"></div>
            
            {/* Particules secondaires */}
            <div className="absolute top-64 left-32 w-1 h-1 bg-amber-400 rounded-full opacity-30"></div>
            <div className="absolute top-80 right-40 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-40"></div>
            <div className="absolute bottom-80 left-40 w-2 h-2 bg-amber-300 rounded-full opacity-35"></div>
            <div className="absolute bottom-64 right-24 w-1 h-1 bg-yellow-300 rounded-full opacity-45"></div>
            
            {/* Particules flottantes complexes */}
            <div className="absolute top-96 left-1/4 w-4 h-4 border border-amber-400/20 rounded-full opacity-25"></div>
            <div className="absolute bottom-96 right-1/4 w-6 h-6 border border-yellow-400/15 rounded-full opacity-20"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
            
            {/* Header with Enhanced Ornaments */}
            <header ref={headerRef} className="text-center mb-16 opacity-0">
              
              {/* Elaborate top ornament */}
              <div ref={ornamentRef} className="flex justify-center items-center mb-12">
                <div className="flex items-center">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-400"></div>
                  <div className="mx-2 w-1 h-1 bg-amber-400 rounded-full"></div>
                  <div className="mx-1 w-8 h-px bg-amber-400"></div>
                  <div className="mx-2 w-2 h-2 border border-amber-400 rotate-45"></div>
                  <div className="mx-2 w-3 h-3 bg-amber-400 rounded-full"></div>
                  <div className="mx-2 w-2 h-2 border border-amber-400 rotate-45"></div>
                  <div className="mx-1 w-8 h-px bg-amber-400"></div>
                  <div className="mx-2 w-1 h-1 bg-amber-400 rounded-full"></div>
                  <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-400"></div>
                </div>
              </div>

              {/* Enhanced title avec effets GSAP */}
              <div className="relative">
                {/* Background decorative elements - gardent leur opacité */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
                
                {/* Side ornaments - gardent leur opacité */}
                <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 hidden lg:block">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-3 h-3 border border-amber-400 rotate-45 floating-ornament"></div>
                    <div className="w-1 h-16 bg-gradient-to-b from-amber-400 to-transparent"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full floating-ornament"></div>
                  </div>
                </div>
                <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 hidden lg:block">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-3 h-3 border border-amber-400 rotate-45 floating-ornament"></div>
                    <div className="w-1 h-16 bg-gradient-to-b from-amber-400 to-transparent"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full floating-ornament"></div>
                  </div>
                </div>

                <div ref={titleRef} className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold text-amber-100 mb-6 leading-tight tracking-wide relative">
                  <div className="relative title-text">
                    GRAND ANNIVERSAIRE
                    <div className="absolute inset-0 text-amber-400/20 blur-sm pointer-events-none">GRAND ANNIVERSAIRE</div>
                  </div>
                  <br />
                  <div className="text-amber-400 text-4xl sm:text-5xl lg:text-7xl relative title-text">
                    30 ANS
                    <div className="absolute inset-0 text-yellow-300/30 blur-sm pointer-events-none">30 ANS</div>
                  </div>
                  <br />
                  <div className="text-2xl sm:text-3xl lg:text-5xl font-light relative title-text">
                    Ben & Lulu
                    <div className="absolute inset-0 text-amber-300/20 blur-sm pointer-events-none">Ben & Lulu</div>
                  </div>
                </div>
              </div>

              {/* Enhanced decorative divider */}
              <div className="flex justify-center items-center my-12">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-px bg-amber-400"></div>
                  <div className="w-1.5 h-1.5 border border-amber-400 rotate-45 floating-ornament"></div>
                  <div className="w-8 h-px bg-amber-400"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <div className="w-4 h-4 border-2 border-amber-400 rounded-full flex items-center justify-center floating-ornament">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  </div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <div className="w-8 h-px bg-amber-400"></div>
                  <div className="w-1.5 h-1.5 border border-amber-400 rotate-45 floating-ornament"></div>
                  <div className="w-4 h-px bg-amber-400"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-xl sm:text-2xl text-amber-200 font-light tracking-widest">
                    CHALET BOURGEOISIAL DES FLANS
                  </p>
                  <div className="flex items-center gap-3 flex-col md:flex-row">
                    <a
                      href="https://maps.app.goo.gl/Z9c6dGAj9RswH26Y6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-amber-400/50 hover:border-amber-400 
                        text-amber-300 hover:text-amber-200 
                        px-4 py-2 font-light text-xs tracking-wider
                        transition-all duration-300 
                        hover:bg-amber-400/10 hover:shadow-lg hover:shadow-amber-400/20
                        relative overflow-hidden group w-full md:w-32 h-12"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="relative z-10 text-center leading-tight">GOOGLE MAPS</span>
                      <div className="absolute inset-0 bg-amber-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </a>

                    <a
                      href="https://maps.apple.com/place?address=Route%20d'Arbaz-Anz%C3%A8re%2040,%201966%20Fortunau%20(Ayent),%20Suisse&coordinate=46.291401,7.415138&name=Chalet%20bourgeoisial%20des%20Flans&place-id=ICC7DB0D3C3CD5A9B&map=h"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-amber-400/50 hover:border-amber-400 
                        text-amber-300 hover:text-amber-200 
                        px-4 py-2 font-light text-xs tracking-wider
                        transition-all duration-300 
                        hover:bg-amber-400/10 hover:shadow-lg hover:shadow-amber-400/20
                        relative overflow-hidden group w-full md:w-32 h-12"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="relative z-10 text-center leading-tight">APPLE PLANS</span>
                      <div className="absolute inset-0 bg-amber-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </a>

                    <a
                      href="https://waze.com/ul/hu0jr2ep7v"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-amber-400/50 hover:border-amber-400 
                        text-amber-300 hover:text-amber-200 
                        px-4 py-2 font-light text-xs tracking-wider
                        transition-all duration-300 
                        hover:bg-amber-400/10 hover:shadow-lg hover:shadow-amber-400/20
                        relative overflow-hidden group w-full md:w-32 h-12"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="relative z-10 text-center leading-tight">WAZE</span>
                      <div className="absolute inset-0 bg-amber-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </a>
                  </div>
                </div>
                <p className="text-lg sm:text-xl text-slate-300 font-light">
                  1972 Anzère
                </p>
                <p className="text-lg sm:text-xl text-slate-300 font-light">
                  9 - 12 Octobre 2025
                </p>
              </div>

              {/* Discrete scroll invitation */}
              <div className="mt-12">
                <div className="flex flex-col items-center cursor-pointer group" onClick={() => {
                  const firstSection = sectionsRef.current[0];
                  if (firstSection) {
                    firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}>
                  <span className="text-amber-300/70 hover:text-amber-200 font-light tracking-widest text-sm mb-3 transition-colors duration-300">
                    DÉCOUVRIR LE PROGRAMME
                  </span>
                  <div className="flex flex-col items-center animate-bounce">
                    <svg className="w-6 h-6 text-amber-400 group-hover:text-amber-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <svg className="w-4 h-4 text-amber-400/50 group-hover:text-amber-300/70 transition-colors duration-300 -mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content sections */}
            <main className="space-y-12">
              
              {/* Welcome section */}
              <section ref={el => sectionsRef.current[0] = el} className="opacity-0">
                <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-8 sm:p-12">
                  <div className="flex justify-center mb-8">
                    <div className="w-8 h-px bg-amber-400"></div>
                    <div className="mx-2 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    <div className="w-8 h-px bg-amber-400"></div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif text-center text-amber-400 mb-8 tracking-wide">
                    Une Nuit de Folie
                  </h2>
                  
                  <p className="text-lg text-slate-200 leading-relaxed text-center font-light">
                    On t'invite à une nuit de folie, de rires, de shots douteux et de souvenirs flous mais inoubliables.
                    Ramène ta bonne humeur, ton sens de la fête et oublie la décence à la maison — on s'occupe du reste !
                  </p>
                </div>
              </section>

              {/* Formulas section */}
              <section ref={el => sectionsRef.current[1] = el} className="opacity-0">
                <div className="text-center mb-10">
                  <h3 className="text-2xl sm:text-3xl font-serif text-amber-400 mb-4">Formules Proposées</h3>
                  <div className="flex justify-center">
                    <div className="w-24 h-px bg-amber-400"></div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="border border-amber-400/40 bg-gray-900/30 p-8 hover:border-amber-400/60 transition-all duration-300 hover:bg-gray-900/50 group">
                    <div className="text-center">
                      <div className="w-12 h-12 border border-amber-400 mx-auto mb-4 flex items-center justify-center glowing-border">
                        <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                        </svg>
                      </div>
                      <h4 className="text-xl font-serif text-amber-300 mb-4">Formule Journée + Soirée</h4>
                      <p className="text-slate-300 font-light leading-relaxed">
                        Rejoignez-nous pour une journée et soirée mémorables dans l'atmosphère festive de notre événement
                      </p>
                    </div>
                  </div>

                  <div className="border border-amber-400/40 bg-gray-900/30 p-8 hover:border-amber-400/60 transition-all duration-300 hover:bg-gray-900/50 group">
                    <div className="text-center">
                      <div className="w-12 h-12 border border-amber-400 mx-auto mb-4 flex items-center justify-center glowing-border">
                        <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z"/>
                        </svg>
                      </div>
                      <h4 className="text-xl font-serif text-amber-300 mb-4">Formule Journée + Soirée + Nuit</h4>
                      <p className="text-slate-300 font-light leading-relaxed">
                        Profitez de l'expérience complète avec hébergement en chambre (parce que dormir, c'est mieux que cuver dans la voiture)
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Program section */}
              <section ref={el => sectionsRef.current[2] = el} className="opacity-0">
                <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 p-8 sm:p-12">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl sm:text-3xl font-serif text-amber-400 mb-4">Programme du Week-end</h3>
                    <div className="flex justify-center">
                      <div className="w-24 h-px bg-amber-400"></div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center glowing-border">
                        <span className="text-amber-400 text-xl">♪</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">DJs Enflammés</h4>
                      <p className="text-slate-400 text-sm font-light">Vendredi et samedi soir</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center glowing-border">
                        <span className="text-amber-400 text-xl">✦</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">Bouffe à Gogo</h4>
                      <p className="text-slate-400 text-sm font-light">Repas copieux inclus</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center glowing-border">
                        <span className="text-amber-400 text-xl">◊</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">Bières et Vins</h4>
                      <p className="text-slate-400 text-sm font-light">Sélection premium</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/50 mx-auto mb-3 flex items-center justify-center glowing-border">
                        <span className="text-amber-400 text-xl">✧</span>
                      </div>
                      <h4 className="text-amber-300 font-serif mb-2">Alcools Forts</h4>
                      <p className="text-slate-400 text-sm font-light">Et softs pour les sages</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xl text-amber-300 font-serif border border-amber-400/30 bg-black/50 p-6 inline-block">
                      Tout est INCLUS dans le prix
                    </p>
                  </div>
                </div>
              </section>

              {/* Call to action */}
              <section ref={el => sectionsRef.current[3] = el} className="opacity-0">
                <div className="border border-amber-400/50 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 p-8 sm:p-12 text-center">
                  <h3 className="text-2xl sm:text-3xl font-serif text-amber-200 mb-6">
                    Les places sont limitées
                  </h3>
                  <p className="text-lg text-amber-100 mb-6 font-light leading-relaxed">
                    Réserve vite ta formule et viens souffler nos 30 bougies comme il se doit ! 
                    Tu peux réserver autant de jours qu'il te plaît, on sera bien évidemment trop heureux 
                    de t'avoir le plus longtemps possible.
                  </p>
                  <div className="flex justify-center">
                    <div className="w-32 h-px bg-amber-400"></div>
                  </div>
                </div>
              </section>

              {/* Final message */}
              <div ref={el => sectionsRef.current[4] = el} className="opacity-0 text-center border border-amber-400/20 bg-gray-900/30 p-8">
                <p className="text-xl font-serif text-amber-300 italic">
                  "On vous promet un week-end mémorable dans les hauteurs, avec l'ambiance des grands soirs 
                  et l'amitié en fond de décor. Amène ta bonne humeur, ta dégaine de fête et ta soif de moments inoubliables !"
                </p>
              </div>
            </main>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-16 mb-12">
              <Link href="/reserver" legacyBehavior>
                <a className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 
                  text-black py-4 px-12 font-serif font-medium text-lg tracking-widest
                  transition-all duration-300 
                  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black
                  text-center w-full sm:w-auto shadow-lg hover:shadow-amber-500/30
                  border border-amber-500">
                  RÉSERVER MAINTENANT
                </a>
              </Link>

              {lastReservationId && (
                <Link href="/pay" legacyBehavior>
                  <a className="border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 
                    py-4 px-12 font-serif font-light text-lg tracking-widest
                    transition-all duration-300 hover:bg-amber-400/10
                    text-center w-full sm:w-auto">
                    STATUT RÉSERVATION
                  </a>
                </Link>
              )}
            </div>
          </div>

          {/* Footer avec animation */}
          <footer className="border-t border-amber-400/20 mt-auto p-8 flex gap-6 flex-wrap items-center justify-center opacity-30 md:opacity-20 hover:opacity-40 transition-all duration-300 relative z-10">
            <div className="flex items-center gap-2 text-slate-400 font-light">
              <span className="footer-text">Site web réalisé par</span>
              <a
                className="footer-link inline-flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-amber-300 transition-colors transform"
                href="https://thbo.ch/"
                target="_blank"
                rel="noopener noreferrer"
              >
                thbo
              </a>
            </div>
          </footer>
        </div>
      </ClickSpark>
    </>
  );
}