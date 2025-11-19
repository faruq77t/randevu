'use client';

import { useState } from 'react';

interface FormData {
  id: number;
  customId: string;
  img?: string;
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

export default function BasvuruSorgula() {
  const [basvuruId, setBasvuruId] = useState('');
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sorgula = async () => {
    if (!basvuruId.trim()) {
      setError('Lütfen başvuru ID girin');
      return;
    }

    setLoading(true);
    setError('');
    setForm(null);

    try {
      
      const response = await fetch(`/api/get-form?id=${basvuruId.trim()}`);
      
      // Response'ın JSON olup olmadığını kontrol et
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API yanıtı JSON formatında değil');
      }
      
      const data = await response.json();

      if (data.success) {
        setForm(data.form);
      } else {
        setError(data.message || 'Başvuru bulunamadı');
      }
    } catch (error) {
      console.error('❌ Sorgulama hatası:', error);
      setError('Sorgulama sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!form) return;
    
    try {
      
      // Önce form ID'sini belirle (customId kullan)
      const formIdToUse = form.customId;
      
      const response = await fetch(`/api/generate-pdf?formId=${formIdToUse}`);
      
      
      if (response.ok) {
        // HTML içeriğini al
        const htmlContent = await response.text();
        
        // Yeni pencere aç ve HTML'i göster
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
          
          // Kullanıcıya yazdırma seçeneği sun
          setTimeout(() => {
            newWindow.print();
          }, 500);
        } else {
          // Pencere açılamazsa HTML'i indir
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `basvuru-${form.customId}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          
          alert('PDF tarayıcıda açıldı. Yazdırmak için Ctrl+P tuşlarını kullanın.');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ PDF oluşturma hatası:', errorText);
        alert('PDF oluşturulamadı: ' + errorText);
      }
    } catch (error) {
      console.error('❌ PDF indirme hatası:', error);
      alert('PDF indirme sırasında hata oluştu: ' );
    }
  };
  
  // Fotoğraf URL'sini oluştur
  const getPhotoUrl = () => {
    if (!form?.img) return null;
    
    // Base64 veri ise
    if (form.img.startsWith('data:')) {
      return form.img;
    }
    
    // URL ise
    return form.img;
  };



  return (
    <div className="sorgula-container">
      <div className="sorgula-header">
        <h1>🔍 Başvuru Sorgula</h1>
        <p>Başvuru durumunuzu öğrenmek için ID'nizi girin</p>
      </div>

      <div className="sorgula-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Başvuru ID'nizi girin (örn: 9325117815 veya 1)"
            value={basvuruId}
            onChange={(e) => setBasvuruId(e.target.value)}
            className="sorgula-input"
            onKeyPress={(e) => e.key === 'Enter' && sorgula()}
          />
          <button 
            onClick={sorgula} 
            disabled={loading}
            className="sorgula-btn"
          >
            {loading ? '🔍 Sorgulanıyor...' : '🔍 Sorgula'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      {form && (
        <div className="basvuru-detail">
          <div className="detail-header">
            <h2>Başvuru Detayları</h2>
            <div className="basvuru-no">
              <strong>Başvuru ID:</strong> {form.customId}
            </div>
          </div>
          

          <div className="detail-grid">
            <div className="detail-item">
              <label>Ad Soyad:</label>
              <span>{form.ad} {form.soyad}</span>
            </div>
            
            <div className="detail-item">
              <label>Baba Adı:</label>
              <span>{form.babaad}</span>
            </div>
            
            <div className="detail-item">
              <label>Anne Adı:</label>
              <span>{form.anead}</span>
            </div>
            
            <div className="detail-item">
              <label>Doğum Tarihi:</label>
              <span>{new Date(form.dogumtarih).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="detail-item">
              <label>Başvuru Yılı:</label>
              <span>{form.basuruyil}</span>
            </div>
            
            <div className="detail-item">
              <label>Süre:</label>
              <span>{form.sure === '1yıl' ? '1 Yıl' : '2 Yıl'}</span>
            </div>
            
            <div className="detail-item">
              <label>Başlangıç:</label>
              <span>{new Date(form.baslangicTarih).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="detail-item">
              <label>Bitiş:</label>
              <span>{new Date(form.bitisTarih).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="detail-item full-width">
              <label>Adres:</label>
              <span>{form.aderss}</span>
            </div>
            
            <div className="detail-item full-width">
              <label>Durum:</label>
              <span className={`status-badge ${form.status}`}>
                {form.status === 'pending' ? '⏳ Onay Bekliyor' : '✅ Onaylandı'}
              </span>
            </div>

            {form.status === 'approved' && form.approvedAt && (
              <div className="detail-item">
                <label>Onay Tarihi:</label>
                <span>{new Date(form.approvedAt).toLocaleDateString('tr-TR')}</span>
              </div>
            )}
          </div>

          {form.status === 'approved' && (
            <div className="action-buttons">
              <button onClick={downloadPDF} className="download-btn">
                📄 PDF Olarak İndir
              </button>
              <p className="download-info">
                <small>PDF dosyasında başvuru ID'niz: <strong>{form.customId}</strong></small>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="sorgula-help">
        <h3>💡 Yardım</h3>
        <ul>
          <li><strong>Başvuru ID'niz:</strong> Formu gönderdikten sonra size verilen numara</li>
          <li><strong>Örnek ID'ler:</strong> "9325117815" (özel ID) veya "1" (sıra numarası)</li>
          <li><strong>PDF İndirme:</strong> Başvurunuz "Onaylandı" durumunda aktif olur</li>
          <li><strong>ID Unutma:</strong> ID'nizi unuttuysanız yeni başvuru yapabilirsiniz</li>
        </ul>
        <a href="/" className="home-link">🏠 Ana Sayfaya Dön</a>
      </div>
    </div>
  );
}