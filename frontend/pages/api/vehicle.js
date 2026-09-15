const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

// Décodage WMI (3 premiers caractères du VIN) pour les marques européennes
const WMI_CODES = {
  'VF1': { marque: 'Renault', pays: 'France' },
  'VF2': { marque: 'Renault', pays: 'France' },
  'VF3': { marque: 'Peugeot', pays: 'France' },
  'VF6': { marque: 'Renault Trucks', pays: 'France' },
  'VF7': { marque: 'Citroën', pays: 'France' },
  'VF8': { marque: 'Renault', pays: 'France' },
  'VR1': { marque: 'DS Automobiles', pays: 'France' },
  'VR3': { marque: 'Peugeot', pays: 'France' },
  'VR7': { marque: 'Citroën', pays: 'France' },
  'VX1': { marque: 'Alpine', pays: 'France' },
  'VXK': { marque: 'Bugatti', pays: 'France' },
  'ZFA': { marque: 'Fiat', pays: 'Italie' },
  'ZFF': { marque: 'Ferrari', pays: 'Italie' },
  'ZAR': { marque: 'Alfa Romeo', pays: 'Italie' },
  'ZAM': { marque: 'Maserati', pays: 'Italie' },
  'WBA': { marque: 'BMW', pays: 'Allemagne' },
  'WBS': { marque: 'BMW M', pays: 'Allemagne' },
  'WDB': { marque: 'Mercedes-Benz', pays: 'Allemagne' },
  'WDD': { marque: 'Mercedes-Benz', pays: 'Allemagne' },
  'WDC': { marque: 'Mercedes-Benz', pays: 'Allemagne' },
  'WVW': { marque: 'Volkswagen', pays: 'Allemagne' },
  'WV1': { marque: 'Volkswagen Utilitaire', pays: 'Allemagne' },
  'WAU': { marque: 'Audi', pays: 'Allemagne' },
  'WA1': { marque: 'Audi', pays: 'Allemagne' },
  'WPO': { marque: 'Porsche', pays: 'Allemagne' },
  'W0L': { marque: 'Opel', pays: 'Allemagne' },
  'TMB': { marque: 'Škoda', pays: 'Tchéquie' },
  'VSS': { marque: 'Seat', pays: 'Espagne' },
  'VXK1': { marque: 'Bugatti', pays: 'France' },
  'SAL': { marque: 'Land Rover', pays: 'Royaume-Uni' },
  'SAJ': { marque: 'Jaguar', pays: 'Royaume-Uni' },
  'SCC': { marque: 'Lotus', pays: 'Royaume-Uni' },
  'SHS': { marque: 'Honda', pays: 'Japon' },
  'JHM': { marque: 'Honda', pays: 'Japon' },
  'JTD': { marque: 'Toyota', pays: 'Japon' },
  'JTM': { marque: 'Toyota', pays: 'Japon' },
  'JN1': { marque: 'Nissan', pays: 'Japon' },
  'KNA': { marque: 'Kia', pays: 'Corée du Sud' },
  'KMH': { marque: 'Hyundai', pays: 'Corée du Sud' },
  'YS3': { marque: 'Saab', pays: 'Suède' },
  'YV1': { marque: 'Volvo', pays: 'Suède' },
  'YV4': { marque: 'Volvo', pays: 'Suède' },
};

const MODELES_RENAULT = {
  'AH': 'Mégane IV',
  'BR': 'Clio IV',
  'BZ': 'Clio V',
  'JA': 'Captur',
  'HFE': 'Zoé',
  'FB': 'Talisman',
  'KD': 'Kadjar',
  'TRE': 'Twingo III',
  'RAT': 'Twingo',
  'U8': 'Master',
  'GA': 'Kangoo',
};

function decoderWMI(vin) {
  const wmi = vin.substring(0, 3);
  return WMI_CODES[wmi] || null;
}

function estimerValeur(marque, annee) {
  if (!annee) return null;
  const age = new Date().getFullYear() - annee;
  const baseParMarque = {
    'Renault': 22000, 'Peugeot': 23000, 'Citroën': 21000,
    'Volkswagen': 27000, 'BMW': 45000, 'Mercedes-Benz': 48000,
    'Audi': 43000, 'Toyota': 26000, 'Honda': 25000,
    'DS Automobiles': 28000, 'Seat': 22000, 'Škoda': 23000,
  };
  const base = baseParMarque[marque] || 18000;
  if (age <= 0) return Math.round(base);
  const valeur = base * Math.pow(0.85, age); // ~15%/an de dépréciation
  return Math.max(0, Math.round(valeur / 100) * 100);
}

export default async function handler(req, res) {
  const { vin } = req.query;

  if (!vin || !VIN_REGEX.test(vin)) {
    return res.status(400).json({ error: 'VIN invalide (17 caractères, sans I/O/Q)' });
  }

  try {
    // 1. Appel API NHTSA (gratuite, sans clé)
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`
    );
    const nhtsa = await response.json();
    const r = (nhtsa.Results && nhtsa.Results[0]) || {};

    // 2. Décodage local WMI (fallback/complément pour les VIN européens)
    const wmiInfo = decoderWMI(vin);

    const marque = (r.Make && r.Make !== '') ? r.Make : (wmiInfo ? wmiInfo.marque : 'Inconnue');
    const marqueFormatee = marque.charAt(0).toUpperCase() + marque.slice(1).toLowerCase()
      .replace('benz', 'Benz').replace('rover', 'Rover');
    const annee = r.ModelYear ? parseInt(r.ModelYear) : null;

    // Modèle : NHTSA ou table locale Renault
    let modele = r.Model || '';
    if ((!modele || modele === '') && marque === 'Renault') {
      const vds = vin.substring(3, 5);
      modele = MODELES_RENAULT[vds] || '';
    }

    const estimation = estimerValeur(marqueFormatee, annee);

    // 3. Construction du rapport
    const rapport = {
      vin,
      vehicule: {
        marque: marqueFormatee,
        modele: modele || 'Non identifié',
        annee: annee || 'Non identifiée',
        carrosserie: r.BodyClass || 'Non spécifiée',
        carburant: r.FuelTypePrimary || 'Non spécifié',
        moteur: r.DisplacementL ? `${r.DisplacementL}L` : (r.EngineConfiguration ? `${r.EngineConfiguration}` : 'Non spécifié'),
        puissance: r.EngineHP ? `${r.EngineHP} ch` : 'Non spécifiée',
        cylindres: r.EngineCylinders ? `${r.EngineCylinders}` : 'Non spécifié',
        transmission: r.TransmissionStyle || 'Non spécifiée',
        portes: r.Doors ? `${r.Doors}` : 'Non spécifié',
        pays: (wmiInfo && wmiInfo.pays) || r.PlantCountry || 'Non spécifié',
      },
      historique: {
        // Ces données nécessitent HistoVec (connexion en cours d'intégration)
        kilometrage: null,
        proprietaires: null,
        accidents: null,
        ct: null,
        vol: null,
        statut: 'bientot',
      },
      estimation: estimation ? {
        valeur_estimee: estimation,
        devise: 'EUR',
        note: 'Estimation indicative basée sur la marque et l\'année',
      } : null,
      sources: [
        { nom: 'NHTSA vPIC (base VIN officielle)', type: 'Données techniques', statut: 'connecté' },
        { nom: 'HistoVec (historique kilométrique, CT, propriétaires)', type: 'Historique', statut: 'en cours d\'intégration' },
      ],
      genere_le: new Date().toISOString(),
    };

    res.status(200).json(rapport);
  } catch (err) {
    res.status(500).json({ error: `Erreur de récupération: ${err.message}` });
  }
}
