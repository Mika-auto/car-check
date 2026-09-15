import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function ReportPage() {
  const router = useRouter();
  const { vin } = router.query;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vin) return;
    setReport({ vin, message: "Backend en cours de connexion - Rapport bientôt disponible" });
    setLoading(false);
  }, [vin]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Head>
        <title>Rapport {vin} - Car Check</title>
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '25px' }}>
          <h1 style={{ marginBottom: '20px' }}>🚗 Rapport pour : {vin}</h1>
          <div style={{ background: '#e7f1ff', padding: '15px', borderRadius: '8px', color: '#084298' }}>
            {report.message}
          </div>
        </div>
      </main>
    </div>
  );
}
