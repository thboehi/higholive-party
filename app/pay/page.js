"use client" // Main page can remain client component or be server, but the one using hooks must be client

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect, useRef, Suspense } from "react"; // Added Suspense
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import ClickSpark from "../components/ClickSpark";

// Component to handle the logic using searchParams
function PaymentDetails() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState({
    totalPrice: 0,
    firstName: '',
    lastName: '',
    reservationId: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const total = searchParams.get('total');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const reservationId = searchParams.get('reservationId');

    if (!total || !firstName || !lastName || !reservationId) {
      setError("Lien de paiement incomplet. Veuillez vérifier que tous les paramètres nécessaires sont présents.");
      setIsLoading(false);
      return;
    }

    const parsedTotalPrice = parseFloat(total);
    if (isNaN(parsedTotalPrice) || parsedTotalPrice <= 0) {
      setError("Le montant total est invalide.");
      setIsLoading(false);
      return;
    }

    setPaymentData({
      totalPrice: parsedTotalPrice,
      firstName,
      lastName,
      reservationId
    });
    setIsLoading(false);
  }, [searchParams]);

  const generateQRContent = () => {
    if (!paymentData.totalPrice || !paymentData.firstName || !paymentData.lastName) {
      return ""; // Return empty or some default if data is not ready
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







${paymentData.totalPrice.toFixed(2)}
CHF







NON

PARTY - ${paymentData.firstName} ${paymentData.lastName}
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

  return (
    <div className="bg-[#111] rounded-2xl p-8 shadow-2xl border border-[#222]">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Résumé de votre réservation</h2>
        
        <div className="flex flex-col space-y-4 w-full max-w-md bg-[#0a0a0a] p-6 rounded-xl border border-[#222] mb-8">
          <div className="flex justify-between">
            <span className="text-gray-400">Nom:</span>
            <span className="text-white font-medium">{paymentData.firstName} {paymentData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Identifiant:</span>
            <span className="text-white font-medium">{paymentData.reservationId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-medium">{paymentData.totalPrice.toFixed(2)} CHF</span>
          </div>
        </div>
        
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
        <p className="text-xl font-bold text-white mb-8">{paymentData.totalPrice.toFixed(2)} CHF</p>
        
        <div className="text-sm text-gray-400 max-w-md text-center">
          <p className="mb-4">
            Si vous ne pouvez pas scanner maintenant, vous pouvez revenir sur ce lien ultérieurement pour effectuer le paiement.
          </p>
          <p>
            Les transferts bancaires peuvent prendre du temps. Si vous avez déjà payé, nous traiterons votre réservation dès que possible.
          </p>
        </div>
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
      <div className="min-h-screen bg-black text-gray-300 py-12 pb-48 flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 w-full">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Paiement</h1>
          <p className="text-2xl font-bold text-center mb-8 text-white">🎉 30 ANS DE BEN & LULU 🎉</p>
          
          <Suspense fallback={<LoadingFallback />}>
            <PaymentDetails />
          </Suspense>
        </div>
        
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center opacity-20 hover:opacity-100 transition-opacity m-12 mt-auto">
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