"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Fonction pour traduire les options en texte lisible
const translateOption = (option) => {
  if (option === "jourEtSoir") return "Journée et soirée";
  if (option === "jourSoirEtNuit") return "Journée, soirée et nuit";
  return option || "N/A";
};

const translateMealOption = (mealOption) => {
  if (mealOption === "midiEtSoir") return "Midi et soir";
  if (mealOption === "soirSeulement") return "Soir uniquement";
  return mealOption || "N/A";
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'paid':
      return 'text-green-400 font-semibold';
    case 'deleted':
      return 'text-red-400 font-semibold line-through';
    case 'pending':
    default:
      return 'text-yellow-400 font-semibold';
  }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsAuthLoading(true);
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(data.message || "Échec de la connexion.");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setLoginError("Une erreur réseau s&apos;est produite.");
      setIsAuthenticated(false);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    } finally {
      setIsAuthenticated(false);
      setReservations([]);
      setSummary(null);
    }
  };

  const fetchReservations = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api');
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
          throw new Error("Session expirée ou invalide. Veuillez vous reconnecter.");
        }
        const errorData = await response.json().catch(() => ({ message: 'Erreur serveur lors de la récupération des réservations' }));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }
      const data = await response.json();
      setReservations(data.data || []);
    } catch (err) {
      console.error("Erreur fetchReservations:", err);
      setError(err.message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
    } else {
      setReservations([]);
      setSummary(null);
    }
  }, [isAuthenticated]);

  const calculateSummary = (reservationsData) => {
    const initialDaySummary = () => ({ name: "", participants: 0, repasMidiSoir: 0, repasSoir: 0, couchages: 0 });
    const newSummary = {
      global: {
        totalReservations: reservationsData.length,
        totalPaid: reservationsData.filter(r => r.status === 'paid').length,
        totalPending: reservationsData.filter(r => r.status === 'pending').length,
        totalDeleted: reservationsData.filter(r => r.status === 'deleted').length,
        totalParticipantsAllReservations: 0,
        totalRevenuePaid: 0,
      },
      days: {
        "Jeudi - 9 octobre 2025": { ...initialDaySummary(), name: "Jeudi" },
        "Vendredi - 10 octobre 2025": { ...initialDaySummary(), name: "Vendredi" },
        "Samedi - 11 octobre 2025": { ...initialDaySummary(), name: "Samedi" },
      }
    };

    const activeReservations = reservationsData.filter(r => r.status !== 'deleted');

    activeReservations.forEach(res => {
      newSummary.global.totalParticipantsAllReservations += res.numberOfPeople;
      if (res.status === 'paid') {
        newSummary.global.totalRevenuePaid += res.totalPrice;
      }

      const joursIndexesPresents = new Set();
      if (res.pass2Days && res.pass2Days.selected) {
        if (res.pass2Days.daysSelection === "jeudiVendredi") { joursIndexesPresents.add(0); joursIndexesPresents.add(1); }
        else if (res.pass2Days.daysSelection === "vendrediSamedi") { joursIndexesPresents.add(1); joursIndexesPresents.add(2); }
        else if (res.pass2Days.daysSelection === "jeudiSamedi") { joursIndexesPresents.add(0); joursIndexesPresents.add(2); }
      } else {
        res.reservations.forEach((dayRes, index) => {
          if (dayRes.option) {
            joursIndexesPresents.add(index);
          }
        });
      }

      joursIndexesPresents.forEach(index => {
        const dayReservationDetails = res.reservations[index];
        const dayKey = dayReservationDetails.day;
        
        if (newSummary.days[dayKey]) {
          newSummary.days[dayKey].participants += res.numberOfPeople;

          if (dayReservationDetails.mealOption === "midiEtSoir") {
            newSummary.days[dayKey].repasMidiSoir += res.numberOfPeople;
          } else if (dayReservationDetails.mealOption === "soirSeulement") {
            newSummary.days[dayKey].repasSoir += res.numberOfPeople;
          }
          
          if (!res.pass2Days.selected && dayReservationDetails.option === "jourSoirEtNuit") {
            newSummary.days[dayKey].couchages += res.numberOfPeople;
          }
        }
      });
    });
    return newSummary;
  };

  useEffect(() => {
    if (reservations.length > 0 && isAuthenticated) {
      setSummary(calculateSummary(reservations));
    } else {
      setSummary(null);
    }
  }, [reservations, isAuthenticated]);

  const updateReservationStatus = async (reservationId, newStatus) => {
    if (!isAuthenticated) return;
    setError(null);
    try {
      const response = await fetch(`/api/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
          throw new Error("Session expirée ou invalide. Veuillez vous reconnecter.");
        }
        const errorData = await response.json().catch(() => ({ message: 'Erreur lors de la mise à jour du statut' }));
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du statut');
      }
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservationId === reservationId ? { ...reservation, status: newStatus } : reservation
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-xl">Vérification de l&apos;authentification...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <div className="w-full max-w-md bg-[#111] p-8 rounded-2xl shadow-2xl border border-[#222]">
          <h1 className="text-3xl font-bold text-center text-purple-400 mb-8">Accès Administrateur</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              />
            </div>
            {loginError && <p className="text-red-400 text-sm mb-4 text-center">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {loginLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loginLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
         <Link href="/" className="mt-8 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
            &larr; Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-xl">Chargement des réservations...</p>
      </div>
    );
  }

  if (error && !reservations.length) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Erreur Critique</h1>
            <p className="text-center mb-4">{error}</p>
            <button
                onClick={fetchReservations}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition-colors cursor-pointer"
            >
                Réessayer
            </button>
            <button
                onClick={handleLogout}
                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors cursor-pointer"
            >
                Se déconnecter
            </button>
            <Link href="/" className="mt-6 text-purple-400 hover:text-purple-300 cursor-pointer">
                Retour à l&apos;accueil
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Page d&apos;Administration</h1>
            <div>
                <button
                    onClick={handleLogout}
                    className="mr-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                    Se déconnecter
                </button>
                <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
                    &larr; Retour à l&apos;accueil
                </Link>
            </div>
        </div>

        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md relative mb-6" role="alert">
                <strong className="font-bold">Erreur: </strong>
                <span className="block sm:inline">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)} style={{cursor: 'pointer'}}>
                    <svg className="fill-current h-6 w-6 text-red-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </span>
            </div>
        )}

        {summary && (
          <div className="bg-[#111] rounded-2xl p-6 shadow-2xl border border-[#222] mb-10">
            <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">Résumé Général</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 text-center">
              <div><p className="text-gray-400 text-sm">Total Réservations</p><p className="text-xl font-bold text-white">{summary.global.totalReservations}</p></div>
              <div><p className="text-gray-400 text-sm">Payées</p><p className="text-xl font-bold text-green-400">{summary.global.totalPaid}</p></div>
              <div><p className="text-gray-400 text-sm">En attente</p><p className="text-xl font-bold text-yellow-400">{summary.global.totalPending}</p></div>
              <div><p className="text-gray-400 text-sm">Annulées</p><p className="text-xl font-bold text-red-400">{summary.global.totalDeleted}</p></div>
              <div><p className="text-gray-400 text-sm">Participants (actifs)</p><p className="text-xl font-bold text-white">{summary.global.totalParticipantsAllReservations}</p></div>
              <div><p className="text-gray-400 text-sm">Revenu (payé)</p><p className="text-xl font-bold text-green-400">{summary.global.totalRevenuePaid.toFixed(2)} CHF</p></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 mt-6 border-b border-gray-700 pb-3">Résumé par Soirée (pour réservations actives)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(summary.days).map(day => (
                <div key={day.name} className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333]">
                  <h4 className="text-lg font-bold text-purple-400 mb-2">{day.name}</h4>
                  <p>Participants: <span className="font-semibold text-white">{day.participants}</span></p>
                  <p>Repas Midi & Soir: <span className="font-semibold text-white">{day.repasMidiSoir}</span></p>
                  <p>Repas Soir: <span className="font-semibold text-white">{day.repasSoir}</span></p>
                  <p>Couchages (option ind.): <span className="font-semibold text-white">{day.couchages}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-white mb-6">Liste des Réservations ({reservations.length})</h2>
        <div className="space-y-6">
          {reservations.length > 0 ? reservations.map(reservation => (
            <div key={reservation.reservationId} className="bg-[#111] rounded-2xl p-6 shadow-2xl border border-[#222] transition-all hover:border-purple-500">
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-purple-400">
                        {reservation.mainContact.firstName} {reservation.mainContact.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">ID: {reservation.reservationId}</p>
                    <p className="text-sm text-gray-400">Email: {reservation.mainContact.email}</p>
                    <p className="text-sm text-gray-400">Adresse: {reservation.mainContact.address}, {reservation.mainContact.town}</p>
                </div>
                <div className="mt-4 md:mt-0 md:text-right">
                    <p className="text-lg">Statut: <span className={getStatusStyle(reservation.status)}>{reservation.status.toUpperCase()}</span></p>
                    <p className="text-gray-400 text-sm">Créée le: {new Date(reservation.createdAt).toLocaleDateString()}</p>
                    <p className="text-xl font-semibold text-white mt-1">{reservation.totalPrice.toFixed(2)} CHF</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-200">Participants: {reservation.numberOfPeople}</p>
                    {reservation.additionalPeople && reservation.additionalPeople.length > 0 && (
                        <div className="pl-4">
                        <p className="text-gray-400">Personnes supplémentaires:</p>
                        <ul className="list-disc list-inside text-gray-300">
                            {reservation.additionalPeople.map((p, i) => <li key={i}>{p.firstName} {p.lastName}</li>)}
                        </ul>
                        </div>
                    )}
                </div>
                <div>
                    <p className="font-semibold text-gray-200">Pass 2 Jours: 
                        <span className="font-normal text-white ml-1">
                        {reservation.pass2Days.selected ? `Oui (${reservation.pass2Days.daysSelection})` : 'Non'}
                        </span>
                    </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="font-semibold text-gray-200 mb-1">Détails des réservations par jour:</p>
                <div className="space-y-1 pl-2 text-sm">
                {reservation.reservations.map((r, index) => {
                    let dayIsActive = false;
                    if (reservation.pass2Days.selected) {
                        if (reservation.pass2Days.daysSelection === "jeudiVendredi" && (index === 0 || index === 1)) dayIsActive = true;
                        if (reservation.pass2Days.daysSelection === "vendrediSamedi" && (index === 1 || index === 2)) dayIsActive = true;
                        if (reservation.pass2Days.daysSelection === "jeudiSamedi" && (index === 0 || index === 2)) dayIsActive = true;
                    } else {
                        if (r.option) dayIsActive = true;
                    }

                    if (dayIsActive) {
                        return (
                            <div key={index} className="p-2 bg-[#0A0A0A] rounded border border-[#333]">
                                <p className="font-medium text-purple-300">{r.day.split(" - ")[0]}:</p>
                                {!reservation.pass2Days.selected && <p className="ml-2 text-gray-300">Option: {translateOption(r.option)}</p>}
                                <p className="ml-2 text-gray-300">Repas: {translateMealOption(r.mealOption)}</p>
                            </div>
                        );
                    }
                    return null;
                })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                {reservation.status !== 'paid' && (
                  <button 
                    onClick={() => updateReservationStatus(reservation.reservationId, 'paid')}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                    disabled={reservation.status === 'paid'}
                  >
                    Marquer Payé
                  </button>
                )}
                {reservation.status !== 'pending' && (
                  <button 
                    onClick={() => updateReservationStatus(reservation.reservationId, 'pending')}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                    disabled={reservation.status === 'pending'}
                  >
                    Marquer En Attente
                  </button>
                )}
                {reservation.status !== 'deleted' && (
                  <button 
                    onClick={() => updateReservationStatus(reservation.reservationId, 'deleted')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                    disabled={reservation.status === 'deleted'}
                  >
                    Annuler Réservation
                  </button>
                )}
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-10">Aucune réservation trouvée. Connectez-vous pour voir les données.</p>
          )}
        </div>
      </div>
    </div>
  );
}