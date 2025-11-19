'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface FormData {
  id: number;
  customId: string;
  ad: string;
  soyad: string;
  babaad: string;
  anead: string;
  dogumtarih: string;
  aderss: string;
  basuruyil: string;
  sure: string;
  baslangicTarih: string;
  bitisTarih: string;
  status: string;
  approvedAt?: string;
}

export default function BasvuruTakip() {
  const params = useParams();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      checkStatus();
      // Her 5 saniyede bir durumu kontrol et
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/get-forms');
      const data = await response.json();
      const foundForm = data.forms.find((f: FormData) => f.id === parseInt(params.id as string));
      setForm(foundForm || null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!form) return;
    
    try {
      const response = await fetch(`/api/generate-pdf?formId=${form.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `basvuru-${form.customId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('PDF indirme başarısız');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('PDF indirme başarısız');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Başvuru Durumu Yükleniyor...</h2>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Başvuru Bulunamadı</h2>
        <p>Lütfen başvuru ID'nizi kontrol edin veya yeni başvuru yapın.</p>
        <a href="/" className="btn-primary">Ana Sayfaya Dön</a>
      </div>
    );
  }

  return (
    <div className="basvuru-container">
      <div className="basvuru-header">
        <h2>Başvuru Durumu</h2>
        <div className="basvuru-id">ID: {form.customId}</div>
      </div>
      
      <div className="basvuru-info">
        <div className="info-item">
          <span className="label">Ad Soyad:</span>
          <span className="value">{form.ad} {form.soyad}</span>
        </div>
        
        <div className="info-item">
          <span className="label">Durum:</span>
          <span className={`status ${form.status}`}>
            {form.status === 'pending' ? '⏳ Onay Bekliyor' : '✅ Onaylandı'}
          </span>
        </div>

        {form.status === 'approved' && form.approvedAt && (
          <div className="info-item">
            <span className="label">Onaylanma Tarihi:</span>
            <span className="value">
              {new Date(form.approvedAt).toLocaleDateString('tr-TR')}
            </span>
          </div>
        )}
      </div>

      {form.status === 'approved' && (
        <div className="pdf-section">
          <button onClick={downloadPDF} className="btn-pdf">
            📄 PDF Olarak İndir
          </button>
        </div>
      )}

      {form.status === 'pending' && (
        <div className="pending-notice">
          <div className="pending-icon">⏳</div>
          <p>Başvurunuz admin onayı beklemektedir.</p>
          <small>Sayfa otomatik olarak güncelleniyor...</small>
        </div>
      )}

      <button onClick={checkStatus} className="btn-secondary">
        🔄 Durumu Güncelle
      </button>
    </div>
  );
}