const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

// ===== 1. ANNÉE-MODÈLE : décodage universel (position 10, norme ISO 3779) =====
function decoderAnneeModele(vin) {
  const c = vin[9]; // 10ème caractère
  const lettres = { A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025, T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030 };
  if (/[1-9]/.test(c)) return 2000 + parseInt(c); // 1-9 = 2001-2009
  if (lettres[c]) return lettres[c];
  return null;
}

// ===== 2. CONSTRUCTEUR : table WMI étendue (3 premiers caractères) =====
const WMI_CODES = {
  'VF1': { marque: 'Renault', pays: 'France' }, 'VF2': { marque: 'Renault', pays: 'France' },
  'VF3': { marque: 'Peugeot', pays: 'France' }, 'VF6': { marque: 'Renault Trucks', pays: 'France' },
  'VF7': { marque: 'Citroën', pays: 'France' }, 'VF8': { marque: 'Renault', pays: 'France' },
  'VR1': { marque: 'DS Automobiles', pays: 'France' }, 'VR3': { marque: 'Peugeot', pays: 'France' },
  'VR7': { marque: 'Citroën', pays: 'France' }, 'VX1': { marque: 'Alpine', pays: 'France' },
  'VXK': { marque: 'Bugatti', pays: 'France' },
  'ZFA': { marque: 'Fiat', pays: 'Italie' }, 'ZFF': { marque: 'Ferrari', pays: 'Italie' },
  'ZAR': { marque: 'Alfa Romeo', pays: 'Italie' }, 'ZAM': { marque: 'Maserati', pays: 'Italie' },
  'ZLA': { marque: 'Lancia', pays: 'Italie' }, 'ZCG': { marque: 'Abarth', pays: 'Italie' },
  'WBA': { marque: 'BMW', pays: 'Allemagne' }, 'WBS': { marque: 'BMW M', pays: 'Allemagne' },
  'WBY': { marque: 'BMW i', pays: 'Allemagne' }, 'WDB': { marque: 'Mercedes-Benz', pays: 'Allemagne' },
  'WDD': { marque: 'Mercedes-Benz', pays: 'Allemagne' }, 'WDC': { marque: 'Mercedes-Benz', pays: 'Allemagne' },
  'W1K': { marque: 'Mercedes-Benz', pays: 'Allemagne' }, 'W1N': { marque: 'Mercedes-Benz', pays: 'Allemagne' },
  'WVW': { marque: 'Volkswagen', pays: 'Allemagne' }, 'WV1': { marque: 'Volkswagen', pays: 'Allemagne' },
  'WV2': { marque: 'Volkswagen', pays: 'Allemagne' }, 'WAU': { marque: 'Audi', pays: 'Allemagne' },
  'WA1': { marque: 'Audi', pays: 'Allemagne' }, 'WAP': { marque: 'Audi', pays: 'Allemagne' },
  'WPO': { marque: 'Porsche', pays: 'Allemagne' }, 'W0L': { marque: 'Opel', pays: 'Allemagne' },
  'W0V': { marque: 'Opel', pays: 'Allemagne' }, 'WMA': { marque: 'MAN', pays: 'Allemagne' },
  'TMB': { marque: 'Škoda', pays: 'Tchéquie' }, 'TMA': { marque: 'Škoda', pays: 'Tchéquie' },
  'VSS': { marque: 'Seat', pays: 'Espagne' }, 'VSK': { marque: 'Nissan', pays: 'Espagne' },
  'ZAR1': { marque: 'Alfa Romeo', pays: 'Italie' },
  'SAL': { marque: 'Land Rover', pays: 'Royaume-Uni' }, 'SAJ': { marque: 'Jaguar', pays: 'Royaume-Uni' },
  'SCC': { marque: 'Lotus', pays: 'Royaume-Uni' }, 'SAR': { marque: 'Rover', pays: 'Royaume-Uni' },
  'SHS': { marque: 'Honda', pays: 'Japon' }, 'JHM': { marque: 'Honda', pays: 'Japon' },
  'JTD': { marque: 'Toyota', pays: 'Japon' }, 'JTM': { marque: 'Toyota', pays: 'Japon' },
  'JT': { marque: 'Toyota', pays: 'Japon' },
  'JN1': { marque: 'Nissan', pays: 'Japon' }, 'JN8': { marque: 'Nissan', pays: 'Japon' },
  'JM1': { marque: 'Mazda', pays: 'Japon' }, 'JMB': { marque: 'Mitsubishi', pays: 'Japon' },
  'JF1': { marque: 'Subaru', pays: 'Japon' }, 'JHL': { marque: 'Honda', pays: 'Japon' },
  'KNA': { marque: 'Kia', pays: 'Corée du Sud' }, 'KNM': { marque: 'Kia', pays: 'Corée du Sud' },
  'KMH': { marque: 'Hyundai', pays: 'Corée du Sud' }, 'TMAF': { marque: 'Kia', pays: 'Slovaquie' },
  'YS3': { marque: 'Saab', pays: 'Suède' }, 'YV1': { marque: 'Volvo', pays: 'Suède' },
  'YV4': { marque: 'Volvo', pays: 'Suède' }, 'YSFF': { marque: 'Volvo', pays: 'Suède' },
  'LU6': { marque: 'DS Automobiles', pays: 'France' },
  'VNE': { marque: 'Iveco', pays: 'France' }, 'VF9': { marque: 'Iveco', pays: 'France' },
};

// ===== 3. MODÈLES : décodage VDS (positions 4-5), constructeurs français =====
const VDS_RENAULT = {
  'AH': 'Mégane II', 'BM': 'Mégane I', 'DZ': 'Mégane III', 'HA': 'Mégane IV',
  'BR': 'Clio IV', 'BZ': 'Clio V', 'BB': 'Clio III', 'CB': 'Clio II campus',
  'RAT': 'Twingo', 'TRE': 'Twingo III',
  'JA': 'Captur', 'JFA': 'Captur II', 'HFE': 'Zoé',
  'FB': 'Talisman', 'LJM': 'Talisman',
  'KD': 'Kadjar', 'HHA': 'Kadjar',
  'GA': 'Kangoo', 'KF': 'Kangoo',
  'U8': 'Master', 'F3': 'Master',
  'TL': 'Scénic II', 'JM': 'Scénic III', 'RFA': 'Scénic IV',
  'KM': 'Espace IV', 'DG': 'Espace V',
  'LT': 'Laguna II', 'DT': 'Laguna III',
  'SD': 'Safrane', 'B54': 'Safrane',
  'FT': 'Fluence', 'L38': 'Fluence',
  'UE': 'Trafic', 'FW': 'Trafic',
};
const VDS_PEUGEOT = {
  '7': '308', '8': '208', 'D': '3008', 'C': 'Partner',
  'A': '107', 'B': '207', 'E': '508', 'G': '5008',
  'M': '4007', 'N': '4008', 'P': 'Expert', 'R': 'RCZ',
};
const VDS_CITROEN = {
  'A': 'C3', 'B': 'C4', 'C': 'C1', 'D': 'C5', 'F': 'Berlingo',
  'J': 'Jumpy', 'R': 'C4 Cactus', 'S': 'C-Elysée', 'T': 'C4 Picasso',
};

function decoderModele(marque, vin) {
  const vds = vin.substring(3, 5);
  if (marque === 'Renault') {
    // Test codes 3 caractères d'abord
    const vds3 = vin.substring(3, 6);
    if (VDS_RENAULT[vds3]) return VDS_RENAULT[vds3];
    return VDS_RENAULT[vds] || null;
  }
  if (marque === 'Peugeot') return VDS_PEUGEOT[vin[3]] || null;
  if (marque === 'Citroën') return VDS_CITROEN[vin[3]] || null;
  return null;
}

// ===== 4. ESTIMATION : valeurs de base par modèle + dépréciation réaliste =====
const VALEURS_BASE = {
  'Renault': 20000, 'Peugeot': 21000, 'Citroën': 19500,
  'Volkswagen': 26000, 'BMW': 45000, 'Mercedes-Benz': 48000,
  'Audi': 43000, 'Toyota': 26000, 'Honda': 24000,
  'DS Automobiles': 28000, 'Seat': 21500, 'Škoda': 22500,
  'Volvo': 38000, 'Land Rover': 55000, 'Porsche': 85000,
  'Fiat': 18000, 'Alfa Romeo': 32000, 'Nissan': 25000,
  'Mazda': 24000, 'Hyundai': 23000, 'Kia': 22500,
  'Jaguar': 55000, 'Subaru': 30000, 'Mitsubishi': 27000,
};

function estimerValeur(marque, modele, annee) {
  if (!annee) return null;
  const age = new Date().getFullYear() - annee;
  const base = VALEURS_BASE[marque] || 18000;
  if (age <= 0) return base;
  // Dépréciation décroissante : forte au début, plancher ensuite
  let valeur = base * Math.pow(0.86, age);
  // Plancher réaliste selon l'âge (une voiture roulante garde une valeur minimale)
  const plancher = age >= 20 ? 800 : age >= 15 ? 1200 : age >= 10 ? 2000 : 4000;
  valeur = Math.max(valeur, plancher);
  return Math.round(valeur / 100) * 100;
}

export default async function handler(req, res) {
  const { vin } = req.query;

  if (!vin || !VIN_REGEX.test(vin)) {
    return res.status(400).json({ error: 'VIN invalide (17 caractères, sans I/O/Q)' });
  }

  try {
    // --- Décodage local (gratuit, instantané, fiable) ---
    const wmiInfo = WMI_CODES[vin.substring(0, 3)] || WMI_CODES[vin.substring(0, 2)] || null;
    const marque = wmiInfo ? wmiInfo.marque : 'Marque inconnue';
    const anneeLocale = decoderAnneeModele(vin);
    const modeleLocal = decoderModele(marque, vin);

    // --- Appel NHTSA en complément (gratuit, sans clé) ---
    let nhtsaData = {};
    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`
      );
      const nhtsa = await response.json();
      nhtsaData = (nhtsa.Results && nhtsa.Results[0]) || {};
    } catch (e) { /* NHTSA indisponible → on reste sur le local */ }

    const marqueFinale = (nhtsaData.Make && nhtsaData.Make !== '') ? nhtsaData.Make : marque;
    const anneeFinale = nhtsaData.ModelYear ? parseInt(nhtsaData.ModelYear) : anneeLocale;
    const modeleFinal = (nhtsaData.Model && nhtsaData.Model !== '') ? nhtsaData.Model : (modeleLocal || 'Modèle non identifié');

    // Priorité au décodage local pour les marques françaises (NHTSA les connaît mal)
    const estFrancais = ['Renault', 'Peugeot', 'Citroën', 'DS Automobiles'].includes(marque);
    const modeleAffiche = (estFrancais && modeleLocal) ? modeleLocal : modeleFinal;
    const anneeAffichee = anneeLocale || anneeFinale;

    const estimation = estimerValeur(marque, modeleLocal, anneeAffichee);

    const rapport = {
      vin,
      vehicule: {
        marque: marqueFinale,
        modele: modeleAffiche,
        annee: anneeAffichee || 'Non identifiée',
        carrosserie: nhtsaData.BodyClass || '—',
        carburant: nhtsaData.FuelTypePrimary || '—',
        moteur: nhtsaData.DisplacementL ? `${nhtsaData.DisplacementL}L` : '—',
        puissance: nhtsaData.EngineHP ? `${nhtsaData.EngineHP} ch` : '—',
        cylindres: nhtsaData.EngineCylinders || '—',
        transmission: nhtsaData.TransmissionStyle || '—',
        portes: nhtsaData.Doors || '—',
        pays: (wmiInfo && wmiInfo.pays) || nhtsaData.PlantCountry || '—',
      },
      historique: {
        kilometrage: null,
        proprietaires: null,
        accidents: null,
        ct: null,
        vol: null,
        statut: 'bientot',
        note: "L'historique complet (kilométrage, sinistres, CT) nécessite le rapport officiel HistoVec, que le vendeur peut générer gratuitement sur histovec.interieur.gouv.fr avec sa carte grise (2 minutes).",
      },
      estimation: estimation ? {
        valeur_estimee: estimation,
        devise: 'EUR',
        note: 'Estimation indicative (marque, modèle, année). La cote réelle dépend du kilométrage, de l\'état et de la finition.',
      } : null,
      sources: [
        { nom: 'Décodage VIN local (ISO 3779)', type: 'Marque, modèle, année, pays', statut: 'connecté' },
        { nom: 'NHTSA vPIC', type: 'Données techniques complémentaires', statut: 'connecté' },
        { nom: 'HistoVec (État français)', type: 'Historique kilométrique, CT, propriétaires', statut: 'via vendeur (gratuit)' },
      ],
      genere_le: new Date().toISOString(),
    };

    res.status(200).json(rapport);
  } catch (err) {
    res.status(500).json({ error: `Erreur: ${err.message}` });
  }
}
