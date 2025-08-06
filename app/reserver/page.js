"use client"
import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ClickSpark from "../components/ClickSpark";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import Link from "next/link";
import 'react-toastify/dist/ReactToastify.css';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Enregistrer le plugin ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const initialFormData = {
  mainContact: {
    firstName: "",
    lastName: "",
    address: "",
    town: "",
    email: "",
  },
  numberOfPeople: 1,
  additionalPeople: [],
  pass2Days: {
    selected: false,
    daysSelection: "", // "jeudiVendredi", "vendrediSamedi", "jeudiSamedi"
  },
  reservations: [
    { day: "Jeudi - 9 octobre 2025", option: "", mealOption: "" },
    { day: "Vendredi - 10 octobre 2025", option: "", mealOption: "" },
    { day: "Samedi - 11 octobre 2025", option: "", mealOption: "" },
  ],
};

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [showQRCode, setShowQRCode] = useState(false);
  const qrRef = useRef(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isReservationConfirmed, setIsReservationConfirmed] = useState(false);
  const [confirmedReservationId, setConfirmedReservationId] = useState(null);

  // Refs pour les animations GSAP
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const formRef = useRef(null);
  const sectionsRef = useRef([]);
  const priceBarRef = useRef(null);
  const modalRef = useRef(null);
  const qrModalRef = useRef(null);
  const successRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    // Animation d'entrée
    const tl = gsap.timeline();
    
    // Animation du header
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: 100, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "power3.out" }
    );

    // Animation des particules flottantes
    const animateParticles = () => {
      const particles = particlesRef.current?.children;
      if (particles) {
        Array.from(particles).forEach((particle, index) => {
          gsap.to(particle, {
            y: `random(-30, -80)`,
            x: `random(-40, 40)`,
            rotation: `random(0, 360)`,
            opacity: `random(0.2, 0.8)`,
            duration: `random(4, 10)`,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * 0.3
          });
        });
      }
    };

    setTimeout(animateParticles, 1000);

    // Animation des sections au scroll - seulement pour les sections fixes
    const initScrollAnimations = () => {
      sectionsRef.current.forEach((section, index) => {
        if (section && index < 4) { // Seulement les 4 premières sections fixes
          gsap.fromTo(section,
            { opacity: 0, y: 80, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    };

    initScrollAnimations();

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Animation pour le changement de prix
  const animatePriceChange = (newPrice) => {
    if (priceBarRef.current) {
      gsap.fromTo(priceBarRef.current.querySelector('.price-amount'),
        { scale: 1.2, color: "#fbbf24" },
        { scale: 1, color: "#ffffff", duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  };

  // Animation pour l'activation/désactivation d'options
  const animateOptionToggle = (element, isActivated) => {
    if (isActivated) {
      gsap.fromTo(element,
        { scale: 0.9, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
      gsap.to(element, {
        boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
        duration: 0.3
      });
    } else {
      gsap.to(element, {
        scale: 0.95,
        opacity: 0.7,
        boxShadow: "none",
        duration: 0.3
      });
    }
  };

  // Animation pour l'affichage de la modal QR
  const showQRModal = () => {
    setShowQRCode(true);
    gsap.set(qrModalRef.current, { opacity: 0, scale: 0.8 });
    gsap.to(qrModalRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    });
  };

  // Animation pour cacher la modal QR
  const hideQRModal = () => {
    gsap.to(qrModalRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => setShowQRCode(false)
    });
  };

  // Animation pour la confirmation
  const showSuccessAnimation = () => {
    setIsReservationConfirmed(true);
  };

  const handleMainContactChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      mainContact: {
        ...formData.mainContact,
        [name]: value,
      }
    });
  };

  const handleAdditionalPersonChange = (index, field, value) => {
    const updatedPeople = [...formData.additionalPeople];
    if (!updatedPeople[index]) {
      updatedPeople[index] = { firstName: "", lastName: "" };
    }
    updatedPeople[index] = {
      ...updatedPeople[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      additionalPeople: updatedPeople,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePass2Days = (isSelected) => {
    const resetReservations = [
      { day: "Jeudi - 9 octobre 2025", option: "", mealOption: "" },
      { day: "Vendredi - 10 octobre 2025", option: "", mealOption: "" },
      { day: "Samedi - 11 octobre 2025", option: "", mealOption: "" },
    ];
    
    const updatedFormData = {
      ...formData,
      pass2Days: {
        selected: isSelected,
        daysSelection: isSelected ? formData.pass2Days.daysSelection : "",
      },
      reservations: resetReservations,
    };
    
    setFormData(updatedFormData);
    calculateTotalPrice(updatedFormData);

    // Animation pour le toggle
    const passSection = document.querySelector('.pass-2-days-section');
    if (passSection) {
      animateOptionToggle(passSection, isSelected);
    }
  };

  const handleDaysSelectionChange = (selection) => {
    const updatedFormData = {
      ...formData,
      pass2Days: {
        ...formData.pass2Days,
        daysSelection: selection,
      },
    };
    
    setFormData(updatedFormData);
    calculateTotalPrice(updatedFormData);
  };

  const handleReservationChange = (index, field, value) => {
    const updatedReservations = [...formData.reservations];
    updatedReservations[index] = {
      ...updatedReservations[index],
      [field]: value,
    };

    const newFormData = {
      ...formData,
      reservations: updatedReservations,
    };
    
    setFormData(newFormData);
    calculateTotalPrice(newFormData);

    // Animation pour le changement d'option
    const dayCard = document.querySelector(`[data-day-index="${index}"]`);
    if (dayCard && value) {
      animateOptionToggle(dayCard, true);
    }
  };

  const calculateTotalPrice = (data) => {
    let price = 0;
    
    if (data.pass2Days.selected) {
      price = 90;
    } else {
      data.reservations.forEach((reservation) => {
        if (reservation.option === "jourEtSoir") {
          price += 45;
        } else if (reservation.option === "jourSoirEtNuit") {
          price += 55;
        }
      });
    }

    price *= data.numberOfPeople;
    
    if (price !== totalPrice) {
      animatePriceChange(price);
    }
    
    setTotalPrice(price);
  };

  const updateNumberOfPeople = (num) => {
    const numPeople = parseInt(num);
    let additionalPeople = [...formData.additionalPeople];
    
    if (numPeople === 1) {
      additionalPeople = [];
    } else {
      additionalPeople = Array(numPeople - 1).fill().map((_, i) => 
        additionalPeople[i] || { firstName: "", lastName: "" }
      );
    }
    
    const updatedFormData = {
      ...formData,
      numberOfPeople: numPeople,
      additionalPeople
    };
    
    setFormData(updatedFormData);
    calculateTotalPrice(updatedFormData);

    // Animation pour les nouvelles personnes
    if (numPeople > 1) {
      setTimeout(() => {
        const additionalSection = document.querySelector('.additional-people-section');
        if (additionalSection) {
          gsap.fromTo(additionalSection,
            { opacity: 0, height: 0 },
            { opacity: 1, height: "auto", duration: 0.8, ease: "power2.out" }
          );
        }
      }, 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      toast.error(
        <div>
          <p className="font-bold mb-2">Merci de corriger les erreurs suivantes:</p>
          <ul className="list-disc pl-4">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          newestOnTop: true,
          closeOnClick: true,
          rtl: false,
          pauseOnFocusLoss: true,
          draggable: true,
          pauseOnHover: true,
          theme: "dark",
          toastClassName: "bg-gray-900 text-white border border-amber-400/30",
        }
      );
      return;
    }
    
    const formattedPrice = totalPrice.toFixed(2);
    
    const qrContent = `SPC
0200
1
CH5400266266100331M2C
S
Böhi Lucien
Nouvelle Avenue
34
1907
Saxon
CH







${formattedPrice}
CHF







NON

PARTY - ${formData.mainContact.firstName} ${formData.mainContact.lastName}
EPD`;
    
    localStorage.setItem("reservationData", JSON.stringify({
      ...formData,
      totalPrice,
      qrContent
    }));
    
    showQRModal();
  };

  const confirmReservation = async () => {
    const loadingToastId = toast.loading("Traitement de votre réservation...", {
      position: "top-right",
      theme: "dark",
      toastClassName: "bg-gray-900 text-white border border-amber-400/30",
    });
    
    try {
      const apiData = {
        ...formData,
        totalPrice
      };
      
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      const data = await response.json();
      toast.dismiss(loadingToastId);
      
      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          toast.error(
            <div>
              <p className="font-bold mb-2">Erreurs de validation:</p>
              <ul className="list-disc pl-4">
                {data.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>,
            {
              position: "top-right",
              autoClose: 5000,
              theme: "dark",
              toastClassName: "bg-gray-900 text-white border border-amber-400/30",
            }
          );
        } else {
          toast.error(data.message || "Une erreur s'est produite", { 
            position: "top-right",
            autoClose: 5000,
            theme: "dark",
            toastClassName: "bg-gray-900 text-white border border-amber-400/30",
          });
        }
        return;
      }
      
      toast.success("Réservation confirmée avec succès!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
        toastClassName: "bg-gray-900 text-white border border-amber-400/30",
      });

      if (data.reservationId) {
        localStorage.setItem('lastReservationId', data.reservationId);
        setConfirmedReservationId(data.reservationId);
      }
      setFormData(initialFormData); 
      setTotalPrice(0); 
      hideQRModal();
      setTimeout(() => showSuccessAnimation(), 300);
      
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Une erreur s'est produite lors de la connexion au serveur", { 
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        toastClassName: "bg-gray-900 text-white border border-amber-400/30",
       });
      console.error("Erreur API:", error);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    const { firstName, lastName, address, town, email } = formData.mainContact;
    if (!firstName.trim()) errors.push("Le prénom du contact principal est requis");
    if (!lastName.trim()) errors.push("Le nom de famille du contact principal est requis");
    if (!address.trim()) errors.push("L'adresse du contact principal est requise");
    if (!town.trim()) errors.push("La ville du contact principal est requise");
    if (!email.trim()) errors.push("L'email du contact principal est requis");
    if (email.trim() && !email.includes('@')) errors.push("L'email doit être valide");
    
    if (formData.numberOfPeople > 1) {
      formData.additionalPeople.forEach((person, index) => {
        if (!person.firstName?.trim()) {
          errors.push(`Le prénom de la personne ${index + 2} est requis`);
        }
        if (!person.lastName?.trim()) {
          errors.push(`Le nom de famille de la personne ${index + 2} est requis`);
        }
      });
    }
    
    if (formData.pass2Days.selected && !formData.pass2Days.daysSelection) {
      errors.push("Veuillez sélectionner quels jours pour le pass 2 jours");
    }
    
    if (!formData.pass2Days.selected) {
      const hasAnyReservation = formData.reservations.some(res => res.option);
      if (!hasAnyReservation) {
        errors.push("Veuillez sélectionner au moins une option de réservation pour un jour");
      }
      
      formData.reservations.forEach((res, index) => {
        if (res.option && !res.mealOption) {
          errors.push(`Veuillez sélectionner une option de repas pour ${res.day}`);
        }
      });
    } else {
      const selectedDays = daysToDisplay();
      selectedDays.forEach(dayIndex => {
        if (!formData.reservations[dayIndex].mealOption) {
          errors.push(`Veuillez sélectionner une option de repas pour ${formData.reservations[dayIndex].day}`);
        }
      });
    }
    
    if (totalPrice <= 0) {
      errors.push("Aucune option n'a été sélectionnée, impossible de procéder au paiement");
    }
    
    return errors;
  };

  const daysToDisplay = () => {
    if (!formData.pass2Days.selected) {
      return [0, 1, 2]; // Afficher tous les jours si pas de pass 2 jours
    }
    
    // Si pass 2 jours sélectionné mais pas encore de choix de jours
    if (!formData.pass2Days.daysSelection) {
      return []; // N'afficher aucun jour jusqu'à ce qu'une sélection soit faite
    }
    
    switch (formData.pass2Days.daysSelection) {
      case "jeudiVendredi":
        return [0, 1];
      case "vendrediSamedi":
        return [1, 2];
      case "jeudiSamedi":
        return [0, 2];
      default:
        return [];
    }
  };

  const handleNewReservation = () => {
    gsap.to(successRef.current, {
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        setIsReservationConfirmed(false);
        setConfirmedReservationId(null);
        // Réanimer l'entrée du formulaire
        gsap.fromTo(formRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
      }
    });
  };

  return (
    <ClickSpark
      sparkColor="#d4af37"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    >
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-slate-100 relative overflow-hidden">
        <ToastContainer />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {/* Coins décoratifs */}
          <div className="absolute top-6 left-6 w-20 h-20">
            <div className="absolute inset-0 border-l-2 border-t-2 border-amber-400 rounded-tl-lg"></div>
            <div className="absolute inset-2 border-l border-t border-amber-300 rounded-tl-lg"></div>
            <div className="absolute top-4 left-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute top-6 right-6 w-20 h-20">
            <div className="absolute inset-0 border-r-2 border-t-2 border-amber-400 rounded-tr-lg"></div>
            <div className="absolute inset-2 border-r border-t border-amber-300 rounded-tr-lg"></div>
            <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Particules flottantes */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-16 w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-60"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full opacity-40"></div>
          <div className="absolute bottom-32 left-24 w-1.5 h-1.5 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full opacity-50"></div>
          <div className="absolute bottom-60 right-32 w-2.5 h-2.5 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full opacity-30"></div>
          <div className="absolute top-32 left-1/3 w-1 h-1 bg-amber-500 rounded-full opacity-40"></div>
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-yellow-500 rounded-full opacity-50"></div>
        </div>

        {/* Header */}
        <header ref={headerRef} className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-8 opacity-0">
          <div className="mb-8">
            <Link href="/" legacyBehavior>
              <a className="inline-flex items-center text-amber-400/70 hover:text-amber-400 transition-all duration-300 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-light tracking-wider">Retour à l'accueil</span>
              </a>
            </Link>
          </div>

          {/* Title avec ornements */}
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
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

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-amber-200 mb-4 tracking-wide relative">
              RÉSERVATION
              <div className="absolute inset-0 text-amber-400/20 blur-sm pointer-events-none">RÉSERVATION</div>
            </h1>
            <p className="text-2xl lg:text-3xl font-serif text-amber-400 mb-8 tracking-widest">
              🎉 30 ANS DE BEN & LULU 🎉
            </p>

            <div className="flex justify-center">
              <div className="w-24 h-px bg-amber-400"></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
          {isReservationConfirmed ? (
            <div ref={successRef} className="">
              <div className="border border-amber-400/40 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm rounded-none p-12 shadow-2xl text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 border-2 border-amber-400 mx-auto mb-6 flex items-center justify-center rounded-full">
                    <svg className="w-12 h-12 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-serif text-amber-400 mb-8 tracking-wide">
                  Merci pour ta réservation !
                </h2>
                
                <div className="space-y-6 mb-10">
                  <p className="text-lg text-slate-200 font-light leading-relaxed">
                    Ta demande a bien été enregistrée.
                  </p>
                  <p className="text-lg text-slate-200 font-light leading-relaxed">
                    Penses à vérifier pour ta boite mail un message de confirmation dans les prochaines minutes.
                    Si tu ne reçois pas de mail (ça arrive souvent..), pas d'inquiétude, clique sur le lien dessous pour voir si tout est bon.
                  </p>
                  
                  {confirmedReservationId && (
                    <div className="border border-amber-400/30 bg-black/30 p-6 my-8">
                      <Link href={`https://party.higholive.ch/pay?reservationId=${confirmedReservationId}`} legacyBehavior>
                        <a className="text-amber-400 hover:text-amber-300 underline font-light tracking-wide transition-colors">
                          Voir l'état de ma réservation
                        </a>
                      </Link>
                    </div>
                  )}
                  
                  <p className="text-sm text-slate-500 font-light italic">
                    (Penses à vérifier tes spams si tu ne vois pas le mail)
                  </p>
                </div>

                <button
                  onClick={handleNewReservation}
                  className="border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 
                  py-4 px-12 font-serif font-light tracking-widest transition-all duration-300 
                  hover:bg-amber-400/10 hover:shadow-lg hover:shadow-amber-400/20
                  relative overflow-hidden group"
                >
                  <span className="relative z-10">NOUVELLE RÉSERVATION</span>
                  <div className="absolute inset-0 bg-amber-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </div>
            </div>
          ) : (
            <div ref={formRef}>
              <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* Section Contact Principal */}
                <section ref={el => sectionsRef.current[0] = el} className="opacity-0">
                  <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-8 lg:p-12">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl lg:text-3xl font-serif text-amber-400 mb-4 tracking-wide">Contact Principal</h2>
                      <div className="flex justify-center">
                        <div className="w-16 h-px bg-amber-400"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase">Prénom</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.mainContact.firstName}
                          onChange={handleMainContactChange}
                          required
                          className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                          py-4 px-6 text-slate-100 font-light tracking-wide
                          focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                          transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase">Nom de famille</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.mainContact.lastName}
                          onChange={handleMainContactChange}
                          required
                          className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                          py-4 px-6 text-slate-100 font-light tracking-wide
                          focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                          transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>
                      
                      <div className="space-y-2 lg:col-span-2">
                        <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase">Adresse</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.mainContact.address}
                          onChange={handleMainContactChange}
                          required
                          className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                          py-4 px-6 text-slate-100 font-light tracking-wide
                          focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                          transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase">Ville</label>
                        <input
                          type="text"
                          name="town"
                          value={formData.mainContact.town}
                          onChange={handleMainContactChange}
                          required
                          className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                          py-4 px-6 text-slate-100 font-light tracking-wide
                          focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                          transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.mainContact.email}
                          onChange={handleMainContactChange}
                          required
                          className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                          py-4 px-6 text-slate-100 font-light tracking-wide
                          focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                          transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Section Nombre de Personnes */}
                <section ref={el => sectionsRef.current[1] = el} className="opacity-0">
                  <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-8 lg:p-12">
                    <div className="text-center mb-8">
                      <h2 className="text-xl lg:text-2xl font-serif text-amber-400 mb-4 tracking-wide">Nombre de Convives</h2>
                      <div className="flex justify-center">
                        <div className="w-12 h-px bg-amber-400"></div>
                      </div>
                    </div>
                    
                    <div className="max-w-md mx-auto">
                      <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase mb-4">Personnes (maximum 4)</label>
                      <select
                        name="numberOfPeople"
                        value={formData.numberOfPeople}
                        onChange={(e) => updateNumberOfPeople(e.target.value)}
                        className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                        py-4 px-6 text-slate-100 font-light tracking-wide
                        focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                        transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer"
                        style={{ 
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d4af37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                          backgroundPosition: `right 1rem center`,
                          backgroundRepeat: `no-repeat`, 
                          backgroundSize: `1.5em 1.5em`,
                          paddingRight: `3rem`
                        }}
                      >
                        {[1, 2, 3, 4].map((num) => (
                          <option key={num} value={num} className="bg-black text-slate-100">{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>
                
                {/* Section Personnes Supplémentaires */}
                {formData.numberOfPeople > 1 && (
                  <section ref={el => sectionsRef.current[2] = el} className="additional-people-section opacity-0">
                    <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-8 lg:p-12">
                      <div className="text-center mb-8">
                        <h2 className="text-xl lg:text-2xl font-serif text-amber-400 mb-4 tracking-wide">Convives Supplémentaires</h2>
                        <div className="flex justify-center">
                          <div className="w-16 h-px bg-amber-400"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-8">
                        {Array.from({ length: formData.numberOfPeople - 1 }).map((_, index) => (
                          <div key={index} className="border border-amber-400/20 bg-black/30 p-6 lg:p-8">
                            <h3 className="text-lg font-serif text-amber-300 mb-6 text-center tracking-wide">
                              Convive {index + 2}
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase">Prénom</label>
                                <input
                                  type="text"
                                  value={formData.additionalPeople[index]?.firstName || ""}
                                  onChange={(e) => handleAdditionalPersonChange(index, "firstName", e.target.value)}
                                  required
                                  className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                                  py-4 px-6 text-slate-100 font-light tracking-wide
                                  focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                                  transition-all duration-300 backdrop-blur-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase">Nom de famille</label>
                                <input
                                  type="text"
                                  value={formData.additionalPeople[index]?.lastName || ""}
                                  onChange={(e) => handleAdditionalPersonChange(index, "lastName", e.target.value)}
                                  required
                                  className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                                  py-4 px-6 text-slate-100 font-light tracking-wide
                                  focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                                  transition-all duration-300 backdrop-blur-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                
                {/* Section Pass 2 jours */}
                <section ref={el => sectionsRef.current[3] = el} className="opacity-0">
                  <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-8 lg:p-12">
                    <div className="text-center mb-8">
                      <h2 className="text-xl lg:text-2xl font-serif text-amber-400 mb-4 tracking-wide">Options de Réservation</h2>
                      <div className="flex justify-center">
                        <div className="w-16 h-px bg-amber-400"></div>
                      </div>
                    </div>
                    
                    <div className="pass-2-days-section border border-amber-400/20 bg-black/30 p-8">
                      <div className="flex items-center mb-6">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="pass2days"
                            checked={formData.pass2Days.selected}
                            onChange={(e) => togglePass2Days(e.target.checked)}
                            className="w-6 h-6 rounded border-2 border-amber-400/50 bg-black/50 
                            checked:bg-amber-400 checked:border-amber-400 
                            focus:ring-2 focus:ring-amber-400/50 transition-all duration-200 cursor-pointer"
                          />
                        </div>
                        <label htmlFor="pass2days" className="ml-4 text-lg lg:text-xl font-serif text-amber-200 cursor-pointer">
                          Pass 2 jours <span className="text-amber-400">(90 CHF par personne)</span>
                        </label>
                      </div>
                      
                      <p className="text-slate-300 font-light mb-6 leading-relaxed">
                        Comprend 2 jours et 2 nuits dans notre demeure montagnarde avec tous les plaisirs inclus
                      </p>
                      
                      {formData.pass2Days.selected && (
                        <div className="mt-6">
                          <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase mb-4">
                            Sélectionnez vos jours
                          </label>
                          <select
                            value={formData.pass2Days.daysSelection}
                            onChange={(e) => handleDaysSelectionChange(e.target.value)}
                            required={formData.pass2Days.selected}
                            className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                            py-4 px-6 text-slate-100 font-light tracking-wide
                            focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                            transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer"
                            style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d4af37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                              backgroundPosition: `right 1rem center`,
                              backgroundRepeat: `no-repeat`, 
                              backgroundSize: `1.5em 1.5em`,
                              paddingRight: `3rem`
                            }}
                          >
                            <option value="" className="bg-black">Choisissez vos jours</option>
                            <option value="jeudiVendredi" className="bg-black">Jeudi et Vendredi</option>
                            <option value="vendrediSamedi" className="bg-black">Vendredi et Samedi</option>
                            <option value="jeudiSamedi" className="bg-black">Jeudi et Samedi</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
                
                {/* Sections Jours */}
                {(() => {
                  const shouldShowDays = !formData.pass2Days.selected || 
                                      (formData.pass2Days.selected && formData.pass2Days.daysSelection);
                  
                  if (!shouldShowDays) return null;
                  
                  const displayDays = daysToDisplay();
                  
                  return (
                    <section className="space-y-8">
                      {formData.reservations.map((reservation, index) => {
                        if (!displayDays.includes(index)) return null;
                        
                        return (
                          <div key={`day-${index}-${formData.pass2Days.selected}-${formData.pass2Days.daysSelection}`} 
                               data-day-index={index} 
                               className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-8 lg:p-12 opacity-100">
                            <div className="text-center mb-8">
                              <h3 className="text-xl lg:text-2xl font-serif text-amber-400 mb-4 tracking-wide">
                                {reservation.day}
                              </h3>
                              <div className="flex justify-center">
                                <div className="w-12 h-px bg-amber-400"></div>
                              </div>
                            </div>
                            
                            <div className="space-y-8">
                              {!formData.pass2Days.selected && (
                                <div>
                                  <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase mb-4">
                                    Formule
                                  </label>
                                  <select
                                    value={reservation.option}
                                    onChange={(e) => handleReservationChange(index, "option", e.target.value)}
                                    className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                                    py-4 px-6 text-slate-100 font-light tracking-wide
                                    focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                                    transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer"
                                    style={{ 
                                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d4af37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                      backgroundPosition: `right 1rem center`,
                                      backgroundRepeat: `no-repeat`, 
                                      backgroundSize: `1.5em 1.5em`,
                                      paddingRight: `3rem`
                                    }}
                                  >
                                    <option value="" className="bg-black">Ne vient pas</option>
                                    <option value="jourEtSoir" className="bg-black">Journée et soirée (45 CHF)</option>
                                    <option value="jourSoirEtNuit" className="bg-black">Journée, soirée et nuit (55 CHF)</option>
                                  </select>
                                </div>
                              )}
                              
                              {(formData.pass2Days.selected || reservation.option) && (
                                <div>
                                  <label className="block text-sm font-light text-amber-200/80 tracking-wider uppercase mb-4">
                                    Préférences Culinaires
                                  </label>
                                  <select
                                    value={reservation.mealOption}
                                    onChange={(e) => handleReservationChange(index, "mealOption", e.target.value)}
                                    className="w-full bg-black/70 border border-amber-400/20 hover:border-amber-400/40 focus:border-amber-400 
                                    py-4 px-6 text-slate-100 font-light tracking-wide
                                    focus:outline-none focus:ring-1 focus:ring-amber-400/50 
                                    transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer"
                                    style={{ 
                                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d4af37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                      backgroundPosition: `right 1rem center`,
                                      backgroundRepeat: `no-repeat`, 
                                      backgroundSize: `1.5em 1.5em`,
                                      paddingRight: `3rem`
                                    }}
                                  >
                                    <option value="" className="bg-black">Aucune préférence</option>
                                    <option value="midiEtSoir" className="bg-black">Midi et soir (inclus)</option>
                                    <option value="soirSeulement" className="bg-black">Soir uniquement (inclus)</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </section>
                  );
                })()}
              </form>
              
              {/* Barre de prix fixe */}
              <div ref={priceBarRef} className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-950/95 to-black/95 backdrop-blur-md shadow-2xl border-t border-amber-400/30 z-50">
                <div className="max-w-4xl mx-auto px-6">
                  <div className="flex items-center justify-between py-6">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-light text-amber-200/70 tracking-widest uppercase">Montant Total</h3>
                      <span className="price-amount text-3xl font-serif font-bold text-amber-400 tracking-wide">
                        {totalPrice} CHF
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 
                      text-black py-4 px-12 font-serif font-medium tracking-widest
                      transition-all duration-300 
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black
                      shadow-lg hover:shadow-amber-500/30 relative overflow-hidden group"
                    >
                      <span className="relative z-10">RÉSERVER</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Modal QR Code */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={qrModalRef} className="bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-none p-8 lg:p-12 max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-serif text-amber-400 mb-4 tracking-wide">Facture QR</h2>
                <div className="flex justify-center">
                  <div className="w-16 h-px bg-amber-400"></div>
                </div>
              </div>
              
              <p className="text-slate-300 font-light mb-8 leading-relaxed text-center">
                Finalisez votre réservation en scannant ce code QR avec votre application bancaire de confiance.
              </p>
              
              <div className="bg-white p-6 mb-6 flex justify-center">
                <QRCodeSVG 
                  value={`SPC
0200
1
CH5400266266100331M2C
S
Böhi Lucien
Nouvelle Avenue
34
1907
Saxon
CH







${totalPrice.toFixed(2)}
CHF







NON

PARTY - ${formData.mainContact.firstName} ${formData.mainContact.lastName}
EPD`}
                  size={250}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                  includeMargin={true}
                />  
              </div>
              
              <p className="text-amber-400 font-serif text-xl mb-8 text-center tracking-wide">
                {totalPrice.toFixed(2)} CHF
              </p>
              
              <p className="text-slate-300 font-light mb-8 leading-relaxed text-center">
                Si le scan n'est pas possible maintenant, aucune inquiétude. Nous vous transmettrons 
                toutes les informations par courrier électronique.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-between mt-8 space-y-4 sm:space-y-0 sm:space-x-6">
                <button 
                  onClick={hideQRModal}
                  className="border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 
                  py-3 px-8 font-serif font-light tracking-wider transition-all duration-300 
                  hover:bg-amber-400/10 text-center flex-1"
                >
                  Retour
                </button>
                
                <button 
                  onClick={confirmReservation}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 
                  text-black py-3 px-8 font-serif font-medium tracking-wider
                  transition-all duration-300 shadow-lg hover:shadow-amber-500/30 flex-1"
                >
                  Confirmer
                </button>
              </div>
              
              <p className="text-slate-500 mt-8 text-xs font-light leading-relaxed text-center">
                Note: Les transferts bancaires nécessitent un délai de traitement. Nous ne pouvons valider 
                les réservations instantanément, mais votre paiement sera dûment reconnu.
              </p>
            </div>
          </div>
        )}
      </div>
    </ClickSpark>
  );
}