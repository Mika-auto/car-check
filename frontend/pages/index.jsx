import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const VIN_REGEX = /\b[A-HJ-NPR-Z0-9]{17}\b/;

function loadTesseract() {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve(window.Tesseract);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error('Impossible de charger le moteur OCR'));
    document.body.appendChild(script);
  });
}

export default function Home() {
  const [vin, setVin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);
  const tesseractRef = useRef(null);

  const stopEverything = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setStatus('');
  };

  useEffect(() => {
    return () => {
      scanningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const scanLoop = async () => {
    while (scanningRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.videoWidth > 0) {
          // Capture du frame (résolution réduite pour la vitesse)
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          setStatus('🔍 Analyse de l\'image...');
          const T = tesseractRef.current;
          const result = await T.recognize(canvas, 'eng', {
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '
          });
          const text = (result.data.text || '').toUpperCase().replace(/\s+/g, ' ');
          const match = text.match(VIN_REGEX);

          if (match) {
            const detectedVin = match[0];
            setStatus(`✅ VIN détecté : ${detectedVin}`);
            scanningRef.current = false;
            // Petit délai pour voir le résultat
            setTimeout(() => {
              stopEverything();
              window.location.href = `/report/${detectedVin}`;
            }, 1200);
            return;
          }
          setStatus('👁️ Aucun VIN trouvé, nouvel essai...');
        }
      } catch (err) {
        console.log('Erreur OCR:', err);
      }
      // Attendre avant la prochaine analyse
      await new Promise(r => setTimeout(r, 1500));
    }
  };

  const handleScanClick = async () => {
    if (isScanning) {
      stopEverything();
      return;
    }

    setError(null);
    try {
      setStatus('⏳ Initialisation du moteur OCR...');
      if (!tesseractRef.current) {
        tesseractRef.current = await loadTesseract();
      }

      setStatus('📷 Activation de la caméra...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      setIsScanning(true);
      setStatus('👁️ Scan en cours...');

      // Attendre que la vidéo soit prête, puis démarrer la boucle de scan
      await new Promise(r => setTimeout(r, 800));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      scanningRef.current = true;
      scanLoop();
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      setStatus('');
      setIsScanning(false);
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
            {isScanning ? "⏹️ Arrêter le scan" : "📷 Scanner VIN (détection auto)"}
          </button>

          {isScanning && (
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #dee2e6' }}
              />
              {/* Cadre de visée */}
              <div style={{
                position: 'absolute',
                top: '30%', left: '10%', right: '10%', height: '25%',
                border: '3px dashed rgba(13, 110, 253, 0.9)',
                borderRadius: '8px',
                pointerEvents: 'none'
              }} />
              {status && (
                <div style={{
                  position: 'absolute',
                  bottom: '10px', left: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  {status}
                </div>
              )}
            </div>
          )}

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
        <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '13px', marginTop: '20px' }}>
          💡 Astuce : cadre le VIN dans le rectangle bleu. Sur la carte grise, c'est le champ « E » (17 caractères).
        </p>
      </main>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
