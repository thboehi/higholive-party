"use client"
import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef } from "react";
import Image from "next/image";
import ClickSpark from "../components/ClickSpark";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [formData, setFormData] = useState(initialFormData); // Utiliser initialFormData

  const [showQRCode, setShowQRCode] = useState(false);
  const qrRef = useRef(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isReservationConfirmed, setIsReservationConfirmed] = useState(false); // Nouvel état

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
    // Réinitialiser les réservations
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

    // Recalculer le prix quand une option change
    const newFormData = {
      ...formData,
      reservations: updatedReservations,
    };
    
    setFormData(newFormData);
    calculateTotalPrice(newFormData);
  };

  const calculateTotalPrice = (data) => {
    let price = 0;
    
    if (data.pass2Days.selected) {
      // Prix fixe pour le pass 2 jours
      price = 90;
    } else {
      // Calcul standard par jour
      data.reservations.forEach((reservation) => {
        if (reservation.option === "jourEtSoir") {
          price += 45;
        } else if (reservation.option === "jourSoirEtNuit") {
          price += 55;
        }
      });
    }

    // Multiplier par le nombre de personnes
    price *= data.numberOfPeople;
    
    setTotalPrice(price);
  };

  const updateNumberOfPeople = (num) => {
    const numPeople = parseInt(num);
    let additionalPeople = [...formData.additionalPeople];
    
    // Ajuster le tableau des personnes supplémentaires
    if (numPeople === 1) {
      additionalPeople = [];
    } else {
      // Conserver les personnes existantes ou ajouter des entrées vides
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
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validation des données
  const validationErrors = validateForm();
  
  if (validationErrors.length > 0) {
    // Afficher les erreurs avec toast
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
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        newestOnTop: true,
        closeOnClick: false,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: "dark",
        toastClassName: "bg-[#222] text-white",
      }
    );
    return;
  }
  
  // Formatage du prix avec 2 décimales et un point
  const formattedPrice = totalPrice.toFixed(2);
  
  // Création du contenu du QR code avec le format exact demandé
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
  
  // Stockage des données pour la page résumé
  localStorage.setItem("reservationData", JSON.stringify({
    ...formData,
    totalPrice,
    qrContent
  }));
  
  // Afficher le QR code
  setShowQRCode(true);
};

// Nouvelle fonction pour envoyer les données à l'API
const confirmReservation = async () => {
  const loadingToastId = toast.loading("Traitement de votre réservation...", {
    position: "top-center",
    theme: "dark",
    toastClassName: "bg-[#222] text-white",
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
            position: "top-center",
            autoClose: 5000,
            theme: "dark",
            toastClassName: "bg-[#222] text-white",
          }
        );
      } else {
        toast.error(data.message || "Une erreur s'est produite", { /* ... toast options ... */ });
      }
      return;
    }
    
    toast.success("Réservation confirmée avec succès!", {
      position: "top-center",
      autoClose: 3000, // Réduire un peu le temps d'affichage
      theme: "dark",
      toastClassName: "bg-[#222] text-white",
    });

    // Actions immédiates après la confirmation et l'affichage du toast
    setFormData(initialFormData); 
    setTotalPrice(0); 
    setIsReservationConfirmed(true); 
    setShowQRCode(false); // Fermer la modal QR
    
  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error("Une erreur s'est produite lors de la connexion au serveur", { /* ... toast options ... */ });
    console.error("Erreur API:", error);
  }
};

// Fonction de validation du formulaire
const validateForm = () => {
  const errors = [];
  
  // Valider le contact principal
  const { firstName, lastName, address, town, email } = formData.mainContact;
  if (!firstName.trim()) errors.push("Le prénom du contact principal est requis");
  if (!lastName.trim()) errors.push("Le nom de famille du contact principal est requis");
  if (!address.trim()) errors.push("L'adresse du contact principal est requise");
  if (!town.trim()) errors.push("La ville du contact principal est requise");
  if (!email.trim()) errors.push("L'email du contact principal est requis");
  if (email.trim() && !email.includes('@')) errors.push("L'email doit être valide");
  
  // Valider les personnes supplémentaires
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
  
  // Valider le pass 2 jours si sélectionné
  if (formData.pass2Days.selected && !formData.pass2Days.daysSelection) {
    errors.push("Veuillez sélectionner quels jours pour le pass 2 jours");
  }
  
  // Valider les réservations quotidiennes
  if (!formData.pass2Days.selected) {
    // Au moins une réservation doit être sélectionnée
    const hasAnyReservation = formData.reservations.some(res => res.option);
    if (!hasAnyReservation) {
      errors.push("Veuillez sélectionner au moins une option de réservation pour un jour");
    }
    
    // Chaque jour sélectionné doit avoir une option de repas
    formData.reservations.forEach((res, index) => {
      if (res.option && !res.mealOption) {
        errors.push(`Veuillez sélectionner une option de repas pour ${res.day}`);
      }
    });
  } else {
    // Si pass 2 jours sélectionné, vérifier que les options de repas sont choisies
    const selectedDays = daysToDisplay();
    selectedDays.forEach(dayIndex => {
      if (!formData.reservations[dayIndex].mealOption) {
        errors.push(`Veuillez sélectionner une option de repas pour ${formData.reservations[dayIndex].day}`);
      }
    });
  }
  
  // Vérifier que le prix total n'est pas 0
  if (totalPrice <= 0) {
    errors.push("Aucune option n'a été sélectionnée, impossible de procéder au paiement");
  }
  
  return errors;
};

  // Détermine quels jours afficher en fonction de la sélection du pass 2 jours
  const daysToDisplay = () => {
    if (!formData.pass2Days.selected) {
      return [0, 1, 2]; // Tous les jours
    }
    
    switch (formData.pass2Days.daysSelection) {
      case "jeudiVendredi":
        return [0, 1]; // Jeudi et Vendredi
      case "vendrediSamedi":
        return [1, 2]; // Vendredi et Samedi
      case "jeudiSamedi":
        return [0, 2]; // Jeudi et Samedi
      default:
        return []; // Aucun jour sélectionné encore
    }
  };

  const handleNewReservation = () => {
    setIsReservationConfirmed(false); // Cacher le message et réafficher le formulaire
    // Le formulaire est déjà réinitialisé, donc pas besoin de setFormData ici
  };

  return (
    <ClickSpark
      sparkColor="#444"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen bg-black text-gray-300 py-12 pb-48">
        <ToastContainer />
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Réservation</h1>
          <p className="text-2xl font-bold text-center mb-8 text-white">🎉 30 ANS DE BEN & LULU 🎉</p>
          
          {isReservationConfirmed ? (
            <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222] text-center">
              <h2 className="text-3xl font-bold mb-6 text-green-500">Merci pour votre réservation !</h2>
              <p className="text-lg mb-4 text-white">
                Votre demande a bien été enregistrée.
              </p>
              <p className="text-lg mb-6 text-white">
                Veuillez vérifier votre boîte de réception (et votre dossier de courriers indésirables/spam) pour l&apos;e-mail de confirmation.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                (Pensez à vérifier vos spams !)
              </p>
              <button
                onClick={handleNewReservation}
                className="bg-violet-600 hover:bg-violet-700 text-white py-3 px-6 rounded-xl font-medium 
                transition duration-300 border border-violet-700 hover:border-violet-800
                focus:outline-none focus:border-violet-900 focus:ring-2 focus:ring-violet-500
                relative overflow-hidden group min-w-[200px] cursor-pointer"
              >
                Faire une nouvelle réservation
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222]">
                <div className="mb-10">
                  <h2 className="text-2xl font-bold mb-6 text-white">Contact principal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-400">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.mainContact.firstName}
                        onChange={handleMainContactChange}
                        required
                        className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                        focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                        hover:border-[#444] transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-400">Nom de famille</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.mainContact.lastName}
                        onChange={handleMainContactChange}
                        required
                        className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                        focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                        hover:border-[#444] transition-all duration-200"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-400">Adresse</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.mainContact.address}
                        onChange={handleMainContactChange}
                        required
                        className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                        focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                        hover:border-[#444] transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-400">Ville</label>
                      <input
                        type="text"
                        name="town"
                        value={formData.mainContact.town}
                        onChange={handleMainContactChange}
                        required
                        className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                        focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                        hover:border-[#444] transition-all duration-200"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.mainContact.email}
                        onChange={handleMainContactChange}
                        required
                        className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                        focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                        hover:border-[#444] transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-10">
                  <label className="block text-sm font-medium mb-2 text-gray-400">Nombre de personnes (max 4)</label>
                  <select
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={(e) => updateNumberOfPeople(e.target.value)}
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                    focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                    hover:border-[#444] transition-all duration-200 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                             backgroundPosition: `right 0.5rem center`,
                             backgroundRepeat: `no-repeat`, 
                             backgroundSize: `1.5em 1.5em`,
                             paddingRight: `2.5rem` }}
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                {formData.numberOfPeople > 1 && (
                  <div className="mb-10">
                    <h2 className="text-xl font-bold mb-6 mt-28 text-white">Personnes supplémentaires</h2>
                    <div className="space-y-6">
                      {Array.from({ length: formData.numberOfPeople - 1 }).map((_, index) => (
                        <div key={index} className="bg-[#0a0a0a] p-5 rounded-xl border border-[#222]">
                          <h3 className="text-lg font-medium mb-4 text-white">Personne {index + 2}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-400">Prénom</label>
                              <input
                                type="text"
                                value={formData.additionalPeople[index]?.firstName || ""}
                                onChange={(e) => handleAdditionalPersonChange(index, "firstName", e.target.value)}
                                required
                                className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                                focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                                hover:border-[#444] transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-400">Nom de famille</label>
                              <input
                                type="text"
                                value={formData.additionalPeople[index]?.lastName || ""}
                                onChange={(e) => handleAdditionalPersonChange(index, "lastName", e.target.value)}
                                required
                                className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                                focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                                hover:border-[#444] transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Section Pass 2 jours */}
                <h2 className="text-xl font-bold mb-6 mt-28 text-white">Options de réservations</h2>
                <div className="mb-10 bg-[#0a0a0a] p-6 rounded-2xl border border-[#222]">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="pass2days"
                      checked={formData.pass2Days.selected}
                      onChange={(e) => togglePass2Days(e.target.checked)}
                      className="w-5 h-5 rounded accent-violet-500 bg-black border-[#333]"
                    />
                    <label htmlFor="pass2days" className="ml-3 text-xl font-medium text-white">
                    Pass 2 jours (comprend 2 jours et 2 nuits - 90 CHF par personne)
                    </label>
                  </div>
                  
                  {formData.pass2Days.selected && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-gray-400">Choisissez vos jours</label>
                      <select
                        value={formData.pass2Days.daysSelection}
                        onChange={(e) => handleDaysSelectionChange(e.target.value)}
                        required={formData.pass2Days.selected}
                        className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                        focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                        hover:border-[#444] transition-all duration-200 appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                 backgroundPosition: `right 0.5rem center`,
                                 backgroundRepeat: `no-repeat`, 
                                 backgroundSize: `1.5em 1.5em`,
                                 paddingRight: `2.5rem` }}
                      >
                        <option value="">Sélectionnez vos jours</option>
                        <option value="jeudiVendredi">Jeudi et Vendredi</option>
                        <option value="vendrediSamedi">Vendredi et Samedi</option>
                        <option value="jeudiSamedi">Jeudi et Samedi</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {/* N'afficher les options de réservation que si le Pass 2 jours n'est pas sélectionné ou si des jours sont sélectionnés */}
                {(!formData.pass2Days.selected || 
                 (formData.pass2Days.selected && formData.pass2Days.daysSelection)) && (
                  <div className="space-y-8 mb-20">
                    {formData.reservations.map((reservation, index) => {
                      // N'afficher que les jours correspondant à la sélection
                      if (!daysToDisplay().includes(index)) return null;
                      
                      return (
                        <div key={index} className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#222]">
                          <h3 className="text-xl font-medium mb-6 border-b border-[#333] pb-3 text-white">{reservation.day}</h3>
                          
                          <div className="space-y-6">
                            {!formData.pass2Days.selected && (
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-400">Option</label>
                                <select
                                  value={reservation.option}
                                  onChange={(e) => handleReservationChange(index, "option", e.target.value)}
                                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                                  focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                                  hover:border-[#444] transition-all duration-200 appearance-none"
                                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                         backgroundPosition: `right 0.5rem center`,
                                         backgroundRepeat: `no-repeat`, 
                                         backgroundSize: `1.5em 1.5em`,
                                         paddingRight: `2.5rem` }}
                                >
                                  <option value="">Ne vient pas</option>
                                  <option value="jourEtSoir">Journée et soirée (45 CHF)</option>
                                  <option value="jourSoirEtNuit">Journée, soirée et nuit (55 CHF)</option>
                                </select>
                              </div>
                            )}
                            
                            {(formData.pass2Days.selected || reservation.option) && (
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-400">Option de repas</label>
                                <select
                                  value={reservation.mealOption}
                                  onChange={(e) => handleReservationChange(index, "mealOption", e.target.value)}
                                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-white 
                                  focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] 
                                  hover:border-[#444] transition-all duration-200 appearance-none"
                                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                         backgroundPosition: `right 0.5rem center`,
                                         backgroundRepeat: `no-repeat`, 
                                         backgroundSize: `1.5em 1.5em`,
                                         paddingRight: `2.5rem` }}
                                >
                                  <option value="">Aucun</option>
                                  <option value="midiEtSoir">Midi et soir (compris)</option>
                                  <option value="soirSeulement">Soir uniquement (compris)</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </form>
              
              {/* Barre fixe en bas de l'écran */}
              <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] border-t border-[#222] z-50">
                <div className="max-w-3xl mx-auto px-4">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex flex-col">
                      <h3 className="text-base font-medium text-gray-400">Montant total:</h3>
                      <span className="text-2xl font-bold text-white">{totalPrice} CHF</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-[#1a1a1a] hover:bg-[#222] text-white py-3 px-6 rounded-xl font-medium 
                      transition duration-300 border border-[#333] hover:border-[#555]
                      focus:outline-none focus:border-[#777] focus:ring-2 focus:ring-[#444]
                      relative overflow-hidden group min-w-[160px] cursor-pointer"
                    >
                      <span className="relative z-10">Réserver</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#222] to-[#333] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Modal QR Code */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-black mb-4">Facture QR</h2>
              <p className="text-gray-700 mb-6">Afin de finaliser ta réservation, tu peux payer en scannant ce code QR avec <strong>ton application bancaire.</strong></p>
              
              <div className="bg-white p-0 rounded-lg flex justify-center" ref={qrRef}>
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
              <p className="text-gray-700 font-bold mb-6 text-center">{totalPrice.toFixed(2)} CHF</p>
              <p className="text-gray-700 mb-6">Si tu ne peux pas scanner maintenant, ne t&apos;en fais pas, <strong>nous t&apos;envoyons un mail</strong> et tu pourras payer plus tard.</p>
              <p className="text-gray-700 mb-6">À noter: Les transferts bancaires peuvent prendre du temps, nous ne sommes donc pas capable de valider les réservations directement. Mais si vous payez, pas d&apos;inquiétude, on verra ! Dans le cas contraire on reviendra vers vous !</p>
              
              <div className="flex justify-between mt-6 space-x-4">
                <button 
                  onClick={() => setShowQRCode(false)}
                  className="px-5 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Retour
                </button>
                
                <button 
                  onClick={confirmReservation}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-grow cursor-pointer"
                >
                  Confirmer la réservation
                </button>
              </div>
            </div>
          </div>
        )}
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center opacity-20 hover:opacity-100 transition-opacity m-12">
            <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
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