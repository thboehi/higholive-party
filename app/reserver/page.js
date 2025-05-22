"use client"
import { useState } from "react";
import Image from "next/image";
import ClickSpark from "../components/ClickSpark";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    mainContact: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
    },
    numberOfPeople: 1,
    additionalPeople: [],
    reservations: [
      { day: "Jeudi - 9 octobre 2025", option: "", mealOption: "" },
      { day: "Vendredi - 10 octobre 2025", option: "", mealOption: "" },
      { day: "Samedi - 11 octobre 2025", option: "", mealOption: "" },
    ],
  });

  const [totalPrice, setTotalPrice] = useState(0);

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
    
    data.reservations.forEach((reservation) => {
      if (reservation.option === "dayAndEvening") {
        price += 45;
      } else if (reservation.option === "dayEveningAndNight") {
        price += 55;
      }
    });

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
    
    // Stockage des données pour la page résumé
    localStorage.setItem("reservationData", JSON.stringify({
      ...formData,
      totalPrice
    }));
    
    // Redirection vers la page résumé
    router.push("/resume");
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
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Réservation</h1>
          <p className="text-2xl font-bold text-center mb-8 text-white">🎉 30 ANS DE BEN & LULU 🎉</p>
          
          <form onSubmit={handleSubmit} className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222]">
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-white">Contact principal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Nom</label>
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
                <h2 className="text-xl font-bold mb-6 text-white">Personnes supplémentaires</h2>
                <div className="space-y-6">
                  {Array.from({ length: formData.numberOfPeople - 1 }).map((_, index) => (
                    <div key={index} className="bg-[#0a0a0a] p-5 rounded-xl border border-[#222]">
                      <h3 className="text-lg font-medium mb-4 text-white">Personne {index + 2}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-400">Nom</label>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-8 mb-20">
              {formData.reservations.map((reservation, index) => (
                <div key={index} className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#222]">
                  <h3 className="text-xl font-medium mb-6 border-b border-[#333] pb-3 text-white">{reservation.day}</h3>
                  
                  <div className="space-y-6">
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
                        <option value="dayAndEvening">Journée et soirée (45 CHF)</option>
                        <option value="dayEveningAndNight">Journée, soirée et nuit (55 CHF)</option>
                      </select>
                    </div>
                    
                    {reservation.option && (
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
                          <option value="lunchAndDinner">Midi et soir (compris)</option>
                          <option value="dinnerOnly">Soir uniquement (compris)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
        </div>
      </div>
    </ClickSpark>
  );
}