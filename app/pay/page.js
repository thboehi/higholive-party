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
  const [icsDataUri, setIcsDataUri] = useState(null); // État pour le lien .ics

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
      const month = parseInt(yyyymmdd_str.substring(4, 6)) - 1; // Mois 0-indexé
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
        const description = `Célébration des 30 ans de Ben & Lulu.\\nJours de présence: ${daysDetails}.\\nConsultez votre réservation: ${window.location.href}\\n\\nDirection: https://maps.app.goo.gl/eTNs9En8m4Sp1zn57`
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
      <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222] flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222]">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-4">Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
        <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222]">
            <p className="text-center text-gray-400">Aucune donnée de réservation à afficher.</p>
        </div>
    );
  }
  
  const { mainContact, numberOfPeople, additionalPeople, pass2Days, reservations, totalPrice, reservationId, status } = paymentData;

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'paid':
        return { text: 'Payée', className: 'text-green-500 font-bold' };
      case 'deleted':
        return { text: 'Annulée', className: 'text-red-500 font-bold' };
      case 'pending':
      default:
        return { text: 'En attente de paiement (Cela peut prendre plusieurs jours)', className: 'text-yellow-500 font-bold' };
    }
  };

  const statusDisplay = getStatusDisplay(status);

  return (
    <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222]">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">Résumé de votre réservation</h2>
        {status && (
          <div className={`text-lg mb-6 text-center ${statusDisplay.className}`}>
            Statut: {statusDisplay.text}
          </div>
        )}
        
        <div className="w-full max-w-md bg-[#0a0a0a] p-6 rounded-xl border border-[#222] mb-8 space-y-3">
          {reservationId && (
            <div className="flex justify-between">
              <span className="text-gray-400">Identifiant:</span>
              <span className="text-white font-medium">{reservationId}</span>
            </div>
          )}

          {mainContact && (
            <>
              {mainContact.firstName && mainContact.lastName && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Contact:</span>
                  <span className="text-white font-medium">{mainContact.firstName} {mainContact.lastName}</span>
                </div>
              )}
              {mainContact.email && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-medium">{mainContact.email}</span>
                </div>
              )}
              {mainContact.address && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Adresse:</span>
                  <span className="text-white font-medium">{mainContact.address}</span>
                </div>
              )}
              {mainContact.town && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ville:</span>
                  <span className="text-white font-medium">{mainContact.town}</span>
                </div>
              )}
            </>
          )}

          {numberOfPeople !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-400">Nombre de personnes:</span>
              <span className="text-white font-medium">{numberOfPeople}</span>
            </div>
          )}

          {additionalPeople && additionalPeople.length > 0 && (
            <div>
              <span className="text-gray-400 block mb-1">Personnes supplémentaires:</span>
              <ul className="list-disc list-inside pl-2">
                {additionalPeople.map((person, index) => (
                  (person.firstName || person.lastName) && (
                    <li key={index} className="text-white text-sm">
                      {person.firstName} {person.lastName}
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {pass2Days && (
            <div className="flex justify-between">
              <span className="text-gray-400">Pass 2 jours:</span>
              <span className="text-white font-medium">
                {pass2Days.selected ? `Oui (${pass2Days.daysSelection || 'Non spécifié'})` : 'Non'}
              </span>
            </div>
          )}

          {reservations && !pass2Days?.selected && reservations.some(r => r.option) && (
             <div>
                <span className="text-gray-400 block mb-1 pt-2 border-t border-gray-700 mt-2">Réservations par jour:</span>
                {reservations.map((res, index) => (
                    res.option && (
                        <div key={index} className="pl-2 mb-1">
                            <p className="text-white font-medium text-sm">{res.day.split(" - ")[0]}:</p>
                            <p className="text-gray-300 text-xs ml-2">- Option: {res.option === "jourEtSoir" ? "Journée et soirée" : res.option === "jourSoirEtNuit" ? "Journée, soirée et nuit" : res.option}</p>
                            {res.mealOption && <p className="text-gray-300 text-xs ml-2">- Repas: {res.mealOption === "midiEtSoir" ? "Midi et soir" : res.mealOption === "soirSeulement" ? "Soir uniquement" : res.mealOption}</p>}
                        </div>
                    )
                ))}
            </div>
          )}
           {pass2Days?.selected && reservations && reservations.some(r => r.mealOption) && (
             <div>
                <span className="text-gray-400 block mb-1 pt-2 border-t border-gray-700 mt-2">Options repas (Pass 2 jours):</span>
                {reservations.map((res, index) => {
                    let showDay = false;
                    if (pass2Days.daysSelection === "jeudiVendredi" && (index === 0 || index === 1)) showDay = true;
                    if (pass2Days.daysSelection === "vendrediSamedi" && (index === 1 || index === 2)) showDay = true;
                    if (pass2Days.daysSelection === "jeudiSamedi" && (index === 0 || index === 2)) showDay = true;
                    
                    return (showDay && res.mealOption && (
                        <div key={index} className="pl-2 mb-1">
                            <p className="text-white font-medium text-sm">{res.day.split(" - ")[0]}:</p>
                            <p className="text-gray-300 text-xs ml-2">- Repas: {res.mealOption === "midiEtSoir" ? "Midi et soir" : res.mealOption === "soirSeulement" ? "Soir uniquement" : res.mealOption}</p>
                        </div>
                    ))
                })}
            </div>
          )}


          {totalPrice !== undefined && (
            <div className="flex justify-between pt-3 border-t border-gray-600 mt-3">
              <span className="text-gray-400 font-bold">Total à payer:</span>
              <span className="text-white font-bold">{Number(totalPrice).toFixed(2)} CHF</span>
            </div>
          )}
        </div>

        {icsDataUri && (status === 'pending' || status === 'paid') && (
          <div className="my-8 text-center">
            <a
              href={icsDataUri}
              download="reservation_ben_lulu_30ans.ics"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 group cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Ajouter au calendrier
            </a>
          </div>
        )}
        
        {status === 'pending' && (
          <>
            <h3 className="text-xl font-bold mb-4 text-white">Facture QR</h3>
            <p className="text-gray-400 mb-6 text-center">
              Pour finaliser votre réservation, scannez ce code QR avec votre application bancaire.
            </p>
            <div className="bg-white p-4 rounded-lg flex justify-center mb-4" ref={qrRef}>
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
                <p className="text-xl font-bold text-white mb-8">{Number(totalPrice).toFixed(2)} CHF</p>
            )}
            <div className="text-sm text-gray-400 max-w-md text-center">
              <p className="mb-4">
                Si vous ne pouvez pas scanner maintenant, vous pouvez revenir sur ce lien ultérieurement pour effectuer le paiement.
              </p>
              <p>
                Les transferts bancaires peuvent prendre du temps. Si vous avez déjà payé, nous traiterons votre réservation dès que possible.
              </p>
            </div>
          </>
        )}
        {status === 'paid' && (
            <p className="text-green-500 text-center text-lg my-8">Cette réservation a déjà été payée. Merci !</p>
        )}
        {status === 'deleted' && (
            <p className="text-red-500 text-center text-lg my-8">Cette réservation a été annulée.</p>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222] flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    </div>
  );
}


export default function PaymentPage() {
  return (
    <ClickSpark
      sparkColor="#444"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen bg-black text-gray-300 pt-12 pb-12 flex flex-col items-center justify-start">
        <div className="max-w-3xl mx-auto px-4 w-full">
          <div className="mb-8">
            <Link href="/" legacyBehavior>
              <a className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour à l&apos;accueil
              </a>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Paiement & Détails</h1>
          <p className="text-2xl font-bold text-center mb-8 text-white">🎉 30 ANS DE BEN & LULU 🎉</p>
          
          <Suspense fallback={<LoadingFallback />}>
            <PaymentDetails />
          </Suspense>
        </div>
        
        <footer className="w-full mt-12 p-8 flex gap-[24px] flex-wrap items-center justify-center opacity-20 hover:opacity-100 transition-opacity border-t border-gray-800">
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