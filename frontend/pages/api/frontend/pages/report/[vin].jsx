import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

function StatutBadge({ statut }) {
  const config = {
    ok: { bg: '#d1e7dd', color: '#0f5132', icon: '✅', label: 'Bon' },
    attention: { bg: '#fff3cd', color: '#664d03', icon: '⚠️', label: 'À vérifier' },
    probleme: { bg: '#f8d7da', color: '#842029', icon: '❌', label: 'Problème' },
    bientot: { bg: '#cff4fc', color: '#055160', icon: '⏳', label: 'Bientôt disponible' },
    inconnu: { bg: '#e9ecef', color: '#495057', icon: '❔', label: 'Non disponible' },
  };
  const c = config[statut] || config.inconnu;
  return (
    <span style={{
      background: c.bg, color: c.color, padding: '6px 12px',
      borderRadius: '20px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
    }}>
      {c.icon} {c.label}
    </span>
  );
}

function Carte({ titre, icon, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '20px', marginBottom: '15px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '15px', color: '#212529', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon} {titre}
      </h2>
      {children}
    </div>
  );
}

function Ligne({ label, valeur }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f3f5' }}>
      <span style={{ color: '#6c757d', fontSize: '14px' }}>{label}</span>
      <span style={{ fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>{valeur || '—'}</span>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const { vin } = router.query;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vin) return;
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/vehicle?vin=${vin}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur API');
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [vin]);

  const partager = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `Rapport ${vin}`, url }); } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Lien copié !');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
      <div style={{ color: '#6c757d' }}>Analyse du VIN en cours...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '20px' }}>
      <div style={{ fontSize: '40px', marginBottom: '15px' }}>❌</div>
      <div style={{ color: '#dc3545', marginBottom: '10px' }}>{error}</div>
      <a href="/" style={{ color: '#0d6efd' }}>← Retour au scanner</a>
    </div>
  );

  const v = report.vehicule;
  const h = report.historique;
  const titre = `${v.marque} ${v.modele}`;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
      <Head>
        <title>Rapport {vin} - Car Check</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* En-tête */}
      <div style={{ background: 'linear-gradient(135deg, #0d6efd, #084298)', padding: '30px 20px', color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>← Nouveau scan</a>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '15px 0 5px' }}>🚗 {titre}</h1>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>VIN : {report.vin}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{v.annee}</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{v.carrosserie}</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '13px' }}>{v.pays}</span>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

        {/* Points de contrôle */}
        <Carte titre="Points de contrôle" icon="📋">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>Kilométrage</div>
              <div style={{ color: '#6c757d', fontSize: '13px' }}>Historique des relevés</div>
            </div>
            <StatutBadge statut="bientot" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>Accidents déclarés</div>
              <div style={{ color: '#6c757d', fontSize: '13px' }}>Sinistres et dommages</div>
            </div>
            <StatutBadge statut="bientot" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>Propriétaires successifs</div>
              <div style={{ color: '#6c757d', fontSize: '13px' }}>Nombre de détenteurs</div>
            </div>
            <StatutBadge statut="bientot" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>Contrôle technique</div>
              <div style={{ color: '#6c757d', fontSize: '13px' }}>Dernier CT et défauts</div>
            </div>
            <StatutBadge statut="bientot" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>Véhicule volé</div>
              <div style={{ color: '#6c757d', fontSize: '13px' }}>Fichier des véhicules volés</div>
            </div>
            <StatutBadge statut="bientot" />
          </div>
        </Carte>

        {/* Fiche technique */}
        <Carte titre="Fiche technique" icon="⚙️">
          <Ligne label="Marque" valeur={v.marque} />
          <Ligne label="Modèle" valeur={v.modele} />
          <Ligne label="Année" valeur={v.annee} />
          <Ligne label="Carrosserie" valeur={v.carrosserie} />
          <Ligne label="Carburant" valeur={v.carburant} />
          <Ligne label="Moteur" valeur={v.moteur} />
          <Ligne label="Puissance" valeur={v.puissance} />
          <Ligne label="Cylindres" valeur={v.cylindres} />
          <Ligne label="Transmission" valeur={v.transmission} />
          <Ligne label="Portes" valeur={v.portes} />
          <Ligne label="Pays de fabrication" valeur={v.pays} />
        </Carte>

        {/* Estimation */}
        {report.estimation && (
          <Carte titre="Estimation" icon="💰">
            <div style={{ textAlign: 'center', padding: '15px 0' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0d6efd' }}>
                {report.estimation.valeur_estimee.toLocaleString('fr-FR')} €
              </div>
              <div style={{ color: '#6c757d', fontSize: '13px', marginTop: '5px' }}>
                {report.estimation.note}
              </div>
            </div>
          </Carte>
        )}

        {/* Sources */}
        <Carte titre="Sources des données" icon="🔎">
          {report.sources.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f3f5' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{s.nom}</div>
                <div style={{ color: '#6c757d', fontSize: '12px' }}>{s.type}</div>
              </div>
              <span style={{
                background: s.statut === 'connecté' ? '#d1e7dd' : '#cff4fc',
                color: s.statut === 'connecté' ? '#0f5132' : '#055160',
                padding: '4px 10px', borderRadius: '15px', fontSize: '12px', whiteSpace: 'nowrap'
              }}>
                {s.statut === 'connecté' ? '✅ Connecté' : '⏳ Intégration'}
              </span>
            </div>
          ))}
          <p style={{ color: '#adb5bd', fontSize: '11px', marginTop: '12px' }}>
            Rapport généré le {new Date(report.genere_le).toLocaleString('fr-FR')}
          </p>
        </Carte>

        {/* Partage */}
        <button
          onClick={partager}
          style={{
            width: '100%', background: '#198754', color: 'white', padding: '15px',
            borderRadius: '10px', border: 'none', fontSize: '16px', fontWeight: '600',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,135,84,0.3)'
          }}
        >
          📤 Partager ce rapport
        </button>
      </main>
    </div>
  );
}
