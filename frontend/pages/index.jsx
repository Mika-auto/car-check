import { useState, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [vin, setVin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleScanClick = async () => {
    if (isScanning) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        setIsScanning(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsScanning(true);
      setError(null);
    } catch (err) {
      setError(`Erreur caméra: ${err.message}`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (vin.length === 17) {
      window.location.href = `/report/${vin}`;
    } else {
      setError("VIN invalide (doit faire 17 caractères)");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
      <Head>
        <title>Car Check - Scanner VIN</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '30px', color: '#212529' }}>
          🔍 Vérifiez l'historique de votre véhicule
        </h1>
        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '25px' }}>
          <button
            onClick={handleScanClick}
            style={{
              width: '100%',
              background: isScanning ? '#dc3545' : '#0d6efd',
              color: 'white',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            {isScanning ? "⏹️ Arrêter le scan" : "📷 Scanner VIN"}
          </button>
          <div style={{ marginBottom: '15px' }}>
            {isScanning && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #dee2e6' }}
              />
            )}
          </div>
          <p style={{ textAlign: 'center', color: '#6c757d', margin: '10px 0' }}>— ou —</p>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="Entrez le VIN (17 caractères)"
              style={{
                flex: 1,
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
              maxLength={17}
            />
            <button
              type="submit"
              style={{
                background: '#0d6efd',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Valider
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
