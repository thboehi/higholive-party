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

  useEffect(() => {
    let idToFetch = searchParams.get('reservationId');
    const localStorageKey = 'lastReservationId';

    if (idToFetch) {
      // Si l'ID est dans l'URL, on l'enregistre dans localStorage
      try {
        localStorage.setItem(localStorageKey, idToFetch);
      } catch (e) {
        console.warn("Impossible d'accéder au localStorage:", e);
      }
    } else {
      // Si l'ID n'est pas dans l'URL, on essaie de le récupérer depuis localStorage
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
        setIsLoading(true); // Remettre isLoading à true au début du fetch
        const response = await fetch(`/api/${currentId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Impossible de récupérer les détails de la réservation.");
          setPaymentData(null); // S'assurer que les anciennes données ne sont pas affichées en cas d'erreur
        } else if (data.data.totalPrice === undefined || data.data.mainContact?.firstName === undefined || data.data.mainContact?.lastName === undefined) {
          setError("Les données de la réservation sont incomplètes pour générer le paiement.");
          setPaymentData(null);
        } else {
          setPaymentData(data.data);
          setError(null); // Effacer les erreurs précédentes en cas de succès
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
  }, [searchParams]); // searchParams reste la dépendance pour réagir aux changements d'URL

  const generateQRContent = () => {
    if (!paymentData || !paymentData.totalPrice || !paymentData.mainContact?.firstName || !paymentData.mainContact?.lastName) {
      return ""; // Retourne une chaîne vide si les données ne sont pas prêtes
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
    // Ce cas ne devrait pas être atteint si isLoading et error sont bien gérés, mais c'est une sécurité.
    return (
        <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222]">
            <p className="text-center text-gray-400">Aucune donnée de réservation à afficher.</p>
        </div>
    );
  }
  
  const { mainContact, numberOfPeople, additionalPeople, pass2Days, reservations, totalPrice, reservationId, status } = paymentData; // Ajout de status

  // Fonction pour déterminer le style et le texte du statut
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
        {/* Affichage du statut */}
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
        
        {/* Affichage du QR Code seulement si le statut est 'pending' */}
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
        {/* Message si déjà payé ou annulé */}
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
      <div className="min-h-screen bg-black text-gray-300 pt-12 flex flex-col items-center justify-center">
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
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Paiement</h1>
          <p className="text-2xl font-bold text-center mb-8 text-white">🎉 30 ANS DE BEN & LULU 🎉</p>
          
          <Suspense fallback={<LoadingFallback />}>
            <PaymentDetails />
          </Suspense>
        </div>
        
        <footer className="mt-auto p-12 flex gap-[24px] flex-wrap items-center justify-center opacity-20 hover:opacity-100 transition-opacity">
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