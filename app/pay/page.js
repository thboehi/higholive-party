"use client"

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import ClickSpark from "../components/ClickSpark";
import Link from "next/link";

// Component to handle the logic using searchParams and API data
function PaymentDetails() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const qrRef = useRef(null);
  const [icsDataUri, setIcsDataUri] = useState(null);

  // Dates fixes de l'événement
  const eventFixedDates = {
    jeudi: { name: "Jeudi 9 Octobre 2025", yyyymmdd: "20251009" },
    vendredi: { name: "Vendredi 10 Octobre 2025", yyyymmdd: "20251010" },
    samedi: { name: "Samedi 11 Octobre 2025", yyyymmdd: "20251011" },
  };

  const getEventStartEndDates = () => {
    if (!paymentData) return null;

    const getNextDayYYYYMMDD = (yyyymmdd_str) => {
      const year = parseInt(yyyymmdd_str.substring(0, 4));
      const month = parseInt(yyyymmdd_str.substring(4, 6)) - 1;
      const day = parseInt(yyyymmdd_str.substring(6, 8));
      const date = new Date(year, month, day);
      date.setDate(date.getDate() + 1);
      return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    };

    let startDateStr, endDateStr;
    let presenceDays = [];

    if (paymentData.pass2Days && paymentData.pass2Days.selected) {
      const selection = paymentData.pass2Days.daysSelection;
      if (selection === "jeudiVendredi") {
        startDateStr = eventFixedDates.jeudi.yyyymmdd;
        endDateStr = getNextDayYYYYMMDD(eventFixedDates.vendredi.yyyymmdd);
        presenceDays = [eventFixedDates.jeudi.name, eventFixedDates.vendredi.name];
      } else if (selection === "vendrediSamedi") {
        startDateStr = eventFixedDates.vendredi.yyyymmdd;
        endDateStr = getNextDayYYYYMMDD(eventFixedDates.samedi.yyyymmdd);
        presenceDays = [eventFixedDates.vendredi.name, eventFixedDates.samedi.name];
      } else if (selection === "jeudiSamedi") {
        startDateStr = eventFixedDates.jeudi.yyyymmdd;
        endDateStr = getNextDayYYYYMMDD(eventFixedDates.samedi.yyyymmdd); 
        presenceDays = [eventFixedDates.jeudi.name, eventFixedDates.samedi.name];
      }
    } else {
      const activeDaysKeys = paymentData.reservations
        .filter(r => r.option)
        .map(r => r.day.toLowerCase().split(' - ')[0]) 
        .sort((a, b) => {
          const order = ['jeudi', 'vendredi', 'samedi'];
          return order.indexOf(a) - order.indexOf(b);
        });

      if (activeDaysKeys.length > 0) {
        const firstDayKey = activeDaysKeys[0];
        const lastDayKey = activeDaysKeys[activeDaysKeys.length - 1];
        if (eventFixedDates[firstDayKey] && eventFixedDates[lastDayKey]) {
          startDateStr = eventFixedDates[firstDayKey].yyyymmdd;
          endDateStr = getNextDayYYYYMMDD(eventFixedDates[lastDayKey].yyyymmdd);
          presenceDays = activeDaysKeys.map(key => eventFixedDates[key]?.name).filter(Boolean);
        }
      }
    }

    if (startDateStr && endDateStr) {
      return {
        startDate: startDateStr, 
        endDate: endDateStr,     
        daysDetails: presenceDays.join(', ')
      };
    }
    return null;
  };
  
  useEffect(() => {
    let idToFetch = searchParams.get('reservationId');
    const localStorageKey = 'lastReservationId';

    if (idToFetch) {
      try {
        localStorage.setItem(localStorageKey, idToFetch);
      } catch (e) {
        console.warn("Impossible d'accéder au localStorage:", e);
      }
    } else {
      try {
        idToFetch = localStorage.getItem(localStorageKey);
      } catch (e) {
        console.warn("Impossible d'accéder au localStorage:", e);
      }
    }

    if (!idToFetch) {
      setError("L'identifiant de la réservation est manquant.");
      setIsLoading(false);
      return;
    }

    const fetchReservationData = async (currentId) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/${currentId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Impossible de récupérer les détails de la réservation.");
          setPaymentData(null);
        } else if (data.data.totalPrice === undefined || data.data.mainContact?.firstName === undefined || data.data.mainContact?.lastName === undefined) {
          setError("Les données de la réservation sont incomplètes pour générer le paiement.");
          setPaymentData(null);
        } else {
          setPaymentData(data.data);
          setError(null);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la réservation:", err);
        setError("Une erreur s'est produite lors de la communication avec le serveur.");
        setPaymentData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservationData(idToFetch);
  }, [searchParams]);

  useEffect(() => {
    if (paymentData) {
      const eventDates = getEventStartEndDates();
      if (eventDates) {
        const { startDate, endDate, daysDetails } = eventDates;
        
        const eventName = "🎉 30 ANS DE BEN & LULU 🎉";
        const location = "Chalet bourgeoisial des Flans, Route d'Anzère / Les Flans, 1966 Ayent, Suisse";
        const description = `Célébration des 30 ans de Ben & Lulu.\\nJours de présence: ${daysDetails}.\\nConsulte ta réservation: ${window.location.href}\\n\\nDirection: https://maps.app.goo.gl/eTNs9En8m4Sp1zn57`
          .replace(/\n/g, '\\n')
          .replace(/,/g, '\\,')
          .replace(/;/g, '\\;');

        const uid = `${paymentData.reservationId || new Date().getTime()}@higholive.party`;
        const dtstamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 15) + "Z";

        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//HighOliveParty//Reservation//EN",
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART;VALUE=DATE:${startDate}`,
          `DTEND;VALUE=DATE:${endDate}`, 
          `SUMMARY:${eventName.replace(/,/g, '\\,').replace(/;/g, '\\;')}`,
          `LOCATION:${location.replace(/,/g, '\\,').replace(/;/g, '\\;')}`,
          `DESCRIPTION:${description}`,
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n");

        setIcsDataUri(`data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`);
      } else {
        setIcsDataUri(null);
      }
    }
  }, [paymentData]); 

  const generateQRContent = () => {
    if (!paymentData || !paymentData.totalPrice || !paymentData.mainContact?.firstName || !paymentData.mainContact?.lastName) {
      return ""; 
    }
    return `SPC
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







${Number(paymentData.totalPrice).toFixed(2)}
CHF







NON

PARTY - ${paymentData.mainContact.firstName} ${paymentData.mainContact.lastName}
EPD`;
  };

  if (isLoading) {
    return (
      <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
        </div>
        <p className="text-amber-200 font-light">Chargement des détails de ta réservation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-400/30 bg-gradient-to-br from-red-900/20 to-black/50 backdrop-blur-sm p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-red-400 mx-auto mb-6 flex items-center justify-center rounded-full">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-red-400 mb-4 tracking-wide">Erreur</h2>
          <p className="text-slate-300 font-light leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-12 text-center">
        <p className="text-slate-300 font-light">Aucune donnée de réservation à afficher.</p>
      </div>
    );
  }
  
  const { mainContact, numberOfPeople, additionalPeople, pass2Days, reservations, totalPrice, reservationId, status, isInvited } = paymentData;

  const getStatusDisplay = (status, isInvited) => {
    switch (status) {
      case 'paid':
        if (isInvited) {
          return { text: 'Payée (Invité(e.s) par les organisateurs)', className: 'text-purple-400' };
        }
        return { text: 'Payée', className: 'text-green-400' };
      case 'deleted':
        return { text: 'Annulée', className: 'text-red-400' };
      case 'pending':
      default:
        return { text: 'En attente de paiement', className: 'text-amber-400' };
    }
  };

  const statusDisplay = getStatusDisplay(status, isInvited);

  return (
    <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-8 lg:p-12">
      
      {/* Header avec ornements */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-6">
          <div className="w-12 h-px bg-amber-400"></div>
          <div className="mx-2 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
          <div className="w-12 h-px bg-amber-400"></div>
        </div>
        
        <h2 className="text-2xl lg:text-3xl font-serif text-amber-400 mb-4 tracking-wide">
          Résumé de ta Réservation
        </h2>
        
        {status && (
          <div className={`text-lg font-serif tracking-wide mb-6 ${statusDisplay.className}`}>
            Statut : {statusDisplay.text}
            {status === 'pending' && !isInvited && (
              <p className="text-sm text-slate-400 font-light mt-1">
                (Cela peut prendre plusieurs jours)
              </p>
            )}
          </div>
        )}
        
        <div className="flex justify-center">
          <div className="w-16 h-px bg-amber-400"></div>
        </div>
      </div>

      {/* Détails de la réservation */}
      <div className="border border-amber-400/20 bg-black/30 p-8 mb-8">
        <div className="space-y-4">
          {reservationId && (
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-400/20 pb-3">
              <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm">Identifiant</span>
              <span className="text-slate-100 font-serif tracking-wide">{reservationId}</span>
            </div>
          )}

          {mainContact && (
            <>
              {mainContact.firstName && mainContact.lastName && (
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-400/20 pb-3">
                  <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm">Contact Principal</span>
                  <span className="text-slate-100 font-serif tracking-wide">{mainContact.firstName} {mainContact.lastName}</span>
                </div>
              )}
              {mainContact.email && (
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-400/20 pb-3">
                  <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm">Email</span>
                  <span className="text-slate-100 font-light tracking-wide break-all">{mainContact.email}</span>
                </div>
              )}
              {mainContact.address && (
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-400/20 pb-3">
                  <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm">Adresse</span>
                  <span className="text-slate-100 font-light tracking-wide">{mainContact.address}</span>
                </div>
              )}
              {mainContact.town && (
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-400/20 pb-3">
                  <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm">Ville</span>
                  <span className="text-slate-100 font-light tracking-wide">{mainContact.town}</span>
                </div>
              )}
            </>
          )}

          {numberOfPeople !== undefined && (
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-400/20 pb-3">
              <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm">Nombre de Convives</span>
              <span className="text-slate-100 font-serif tracking-wide">{numberOfPeople}</span>
            </div>
          )}

          {additionalPeople && additionalPeople.length > 0 && (
            <div className="border-b border-amber-400/20 pb-4">
              <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm block mb-3">Convives Supplémentaires</span>
              <div className="space-y-2">
                {additionalPeople.map((person, index) => (
                  (person.firstName || person.lastName) && (
                    <div key={index} className="text-slate-100 font-light tracking-wide pl-4">
                      • {person.firstName} {person.lastName}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {pass2Days && (
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-400/20 pb-3">
              <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm">Pass 2 Jours</span>
              <span className="text-slate-100 font-serif tracking-wide">
                {pass2Days.selected ? (
                  <span className="text-amber-300">
                    Oui ({pass2Days.daysSelection === 'jeudiVendredi' ? 'Jeudi & Vendredi' :
                         pass2Days.daysSelection === 'vendrediSamedi' ? 'Vendredi & Samedi' :
                         pass2Days.daysSelection === 'jeudiSamedi' ? 'Jeudi & Samedi' : 'Non spécifié'})
                  </span>
                ) : 'Non'}
              </span>
            </div>
          )}

          {reservations && !pass2Days?.selected && reservations.some(r => r.option) && (
            <div className="border-b border-amber-400/20 pb-4">
              <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm block mb-3">Réservations par Jour</span>
              <div className="space-y-3">
                {reservations.map((res, index) => (
                  res.option && (
                    <div key={index} className="border border-amber-400/10 bg-black/20 p-4">
                      <p className="text-amber-300 font-serif tracking-wide mb-2">{res.day.split(" - ")[0]}</p>
                      <p className="text-slate-300 font-light text-sm">
                        • Formule : {res.option === "jourEtSoir" ? "Journée et soirée" : 
                                   res.option === "jourSoirEtNuit" ? "Journée, soirée et nuit" : res.option}
                      </p>
                      {res.mealOption && (
                        <p className="text-slate-300 font-light text-sm">
                          • Repas : {res.mealOption === "midiEtSoir" ? "Midi et soir" : 
                                    res.mealOption === "soirSeulement" ? "Soir uniquement" : res.mealOption}
                        </p>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {pass2Days?.selected && reservations && reservations.some(r => r.mealOption) && (
            <div className="border-b border-amber-400/20 pb-4">
              <span className="text-amber-200/80 font-light tracking-wider uppercase text-sm block mb-3">Options Repas (Pass 2 jours)</span>
              <div className="space-y-3">
                {reservations.map((res, index) => {
                  let showDay = false;
                  if (pass2Days.daysSelection === "jeudiVendredi" && (index === 0 || index === 1)) showDay = true;
                  if (pass2Days.daysSelection === "vendrediSamedi" && (index === 1 || index === 2)) showDay = true;
                  if (pass2Days.daysSelection === "jeudiSamedi" && (index === 0 || index === 2)) showDay = true;
                  
                  return (showDay && res.mealOption && (
                    <div key={index} className="border border-amber-400/10 bg-black/20 p-4">
                      <p className="text-amber-300 font-serif tracking-wide mb-2">{res.day.split(" - ")[0]}</p>
                      <p className="text-slate-300 font-light text-sm">
                        • Repas : {res.mealOption === "midiEtSoir" ? "Midi et soir" : 
                                  res.mealOption === "soirSeulement" ? "Soir uniquement" : res.mealOption}
                      </p>
                    </div>
                  ))
                })}
              </div>
            </div>
          )}

          {totalPrice !== undefined && (
            <div className="flex flex-col sm:flex-row sm:justify-between pt-4 border-t-2 border-amber-400/40">
              <span className="text-amber-300 font-serif tracking-wider uppercase text-lg">Total à Payer</span>
              <div className="flex flex-col sm:items-end">
                <span className="text-amber-400 font-serif font-bold text-2xl tracking-wide">
                  {Number(totalPrice).toFixed(2)} CHF
                </span>
                {isInvited && (
                  <span className="text-purple-400 text-sm font-light mt-1 italic">
                    (Pris en charge par les organisateurs)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton calendrier */}
      {icsDataUri && (status === 'pending' || status === 'paid') && (
        <div className="text-center mb-8">
          <a
            href={icsDataUri}
            download="reservation_ben_lulu_30ans.ics"
            className="inline-flex items-center border border-amber-400/50 hover:border-amber-400 
            text-amber-300 hover:text-amber-200 
            py-3 px-8 font-serif font-light tracking-wider
            transition-all duration-300 
            hover:bg-amber-400/10 hover:shadow-lg hover:shadow-amber-400/20
            relative overflow-hidden group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="relative z-10">AJOUTER AU CALENDRIER</span>
            <div className="absolute inset-0 bg-amber-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </a>
        </div>
      )}
      
      {/* Section QR Code et statut */}
      {status === 'pending' && !isInvited && (
        <div className="text-center">
          <div className="mb-8">
            <h3 className="text-xl lg:text-2xl font-serif text-amber-400 mb-4 tracking-wide">Facture QR</h3>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-px bg-amber-400"></div>
            </div>
            <p className="text-slate-300 font-light leading-relaxed mb-6">
              Finalise ta réservation en scannant ce code QR avec ton application bancaire de confiance.
            </p>
          </div>
          
          <div className="bg-white p-6 inline-block mb-6">
            <QRCodeSVG 
              value={generateQRContent()}
              size={250}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={true}
            />
          </div>
          
          {totalPrice !== undefined && (
            <p className="text-2xl font-serif font-bold text-amber-400 mb-8 tracking-wide">
              {Number(totalPrice).toFixed(2)} CHF
            </p>
          )}
          
          <div className="border border-amber-400/20 bg-black/30 p-6 max-w-2xl mx-auto">
            <p className="text-slate-300 font-light leading-relaxed mb-4">
              Si le scan n'est pas possible maintenant, aucune inquiétude. Tu peux revenir sur ce lien 
              ultérieurement pour effectuer le paiement.
            </p>
            <p className="text-slate-400 font-light text-sm leading-relaxed">
              Les transferts bancaires nécessitent un délai de traitement. Si tu as déjà effectué le paiement, 
              nous traiterons ta réservation dès réception.
            </p>
          </div>
        </div>
      )}

      {status === 'paid' && (
        <div className="text-center border border-green-400/30 bg-green-900/20 p-8">
          {isInvited && (
            <div className="w-16 h-16 border-2 border-purple-400 mx-auto mb-6 flex items-center justify-center rounded-full">
              <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
          {!isInvited && (
            <div className="w-16 h-16 border-2 border-green-400 mx-auto mb-6 flex items-center justify-center rounded-full">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          )}
          <h3 className={`text-2xl font-serif mb-4 tracking-wide ${isInvited ? 'text-purple-400' : 'text-green-400'}`}>
            {isInvited ? 'Réservation Confirmée (Invité)' : 'Réservation Confirmée'}
          </h3>
          <p className="text-slate-200 font-light leading-relaxed">
            {isInvited 
              ? 'Tu es invité(e) par les organisateurs. Nous avons hâte de t\'accueillir !' 
              : 'Cette réservation a été payée et confirmée. Nous avons hâte de t\'accueillir !'}
          </p>
        </div>
      )}

      {status === 'deleted' && (
        <div className="text-center border border-red-400/30 bg-red-900/20 p-8">
          <div className="w-16 h-16 border-2 border-red-400 mx-auto mb-6 flex items-center justify-center rounded-full">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-serif text-red-400 mb-4 tracking-wide">Réservation Annulée</h3>
          <p className="text-slate-200 font-light leading-relaxed">
            Cette réservation a été annulée et n'est plus valide.
          </p>
        </div>
      )}
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 flex items-center justify-center">
      <div className="border border-amber-400/30 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
        </div>
        <p className="text-amber-200 font-light">Chargement...</p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <ClickSpark
      sparkColor="#d4af37"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-slate-100 relative overflow-hidden">
        
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-16 w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-60"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full opacity-40"></div>
          <div className="absolute bottom-32 left-24 w-1.5 h-1.5 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full opacity-50"></div>
          <div className="absolute bottom-60 right-32 w-2.5 h-2.5 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full opacity-30"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          
          {/* Header */}
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
          <div className="text-center mb-12">
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

            <h1 className="text-3xl lg:text-5xl font-serif font-bold text-amber-200 mb-4 tracking-wide relative">
              PAIEMENT & DÉTAILS
              <div className="absolute inset-0 text-amber-400/20 blur-sm pointer-events-none">PAIEMENT & DÉTAILS</div>
            </h1>
            <p className="text-xl lg:text-2xl font-serif text-amber-400 mb-8 tracking-widest">
              🎉 30 ANS DE BEN & LULU 🎉
            </p>

            <div className="flex justify-center">
              <div className="w-24 h-px bg-amber-400"></div>
            </div>
          </div>
          
          <Suspense fallback={<LoadingFallback />}>
            <PaymentDetails />
          </Suspense>
        </div>
        
        {/* Footer */}
        <footer className="relative z-10 border-t border-amber-400/20 mt-auto p-8 flex gap-6 flex-wrap items-center justify-center opacity-20 hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2 text-slate-400 font-light">
            <span>Site web réalisé par</span>
            <a
              className="inline-flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-amber-300 transition-colors"
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
  );
}