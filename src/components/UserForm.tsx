'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface FormSubmission {
  img: File | null;
  ad: string;
  soyad: string;
  babaad: string;
  anead: string;
  dogumtarih: string;
  aderss: string;
  basuruyil: string;
  sure: '1yıl' | '2yıl';
  baslangicTarih: string;
  bitisTarih: string;
}

export default function UserForm() {
  const [formData, setFormData] = useState<FormSubmission>({
    img: null,
    ad: '',
    soyad: '',
    babaad: '',
    anead: '',
    dogumtarih: '',
    aderss: '',
    basuruyil: new Date().getFullYear().toString(),
    sure: '1yıl',
    baslangicTarih: '',
    bitisTarih: ''
  });

  const [preview, setPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{ad: string; soyad: string; customId: string}>({
    ad: '',
    soyad: '',
    customId: ''
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        alert('Lütfen sadece resim dosyası yükleyin');
        return;
      }

      // Dosya boyutunu kontrol et (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Resim boyutu 2MB\'dan küçük olmalıdır');
        return;
      }

      setFormData({ ...formData, img: file });
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const sure = e.target.value as '1yıl' | '2yıl';
    setFormData({ ...formData, sure });
    
    // Otomatik bitiş tarihi hesapla
    if (formData.baslangicTarih) {
      calculateEndDate(formData.baslangicTarih, sure);
    }
  };

  const handleBaslangicTarihChange = (e: ChangeEvent<HTMLInputElement>) => {
    const baslangicTarih = e.target.value;
    setFormData({ ...formData, baslangicTarih });
    
    // Otomatik bitiş tarihi hesapla
    if (baslangicTarih) {
      calculateEndDate(baslangicTarih, formData.sure);
    }
  };

  const calculateEndDate = (startDate: string, duration: '1yıl' | '2yıl') => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    if (duration === '1yıl') {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 2);
    }
    
    setFormData(prev => ({
      ...prev,
      bitisTarih: end.toISOString().split('T')[0]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Kopyalama başarılı mesajı gösterebilirsiniz
      alert('ID kopyalandı!');
    }).catch(err => {
      console.error('Kopyalama hatası:', err);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = '';

      // 1. Önce customId oluştur
      const tempCustomId = 'temp_' + Date.now();

      // 2. Resmi yükle (temp isimle)
      if (formData.img) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', formData.img);
        uploadFormData.append('customId', tempCustomId);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
        } else {
          throw new Error('Resim yüklenemedi');
        }
      }

      // 3. Formu gönder ve gerçek customId'yi al
      const formResponse = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          img: imageUrl,
          ad: formData.ad,
          soyad: formData.soyad,
          babaad: formData.babaad,
          anead: formData.anead,
          dogumtarih: formData.dogumtarih,
          aderss: formData.aderss,
          basuruyil: formData.basuruyil,
          sure: formData.sure,
          baslangicTarih: formData.baslangicTarih,
          bitisTarih: formData.bitisTarih
        }),
      });

      if (formResponse.ok) {
        const result = await formResponse.json();
        const realCustomId = result.customId;

        // Başarılı popup'ını göster
        setSuccessData({
          ad: formData.ad,
          soyad: formData.soyad,
          customId: realCustomId
        });
        setShowSuccessPopup(true);
        
        // 5. Formu temizle
        setFormData({
          img: null,
          ad: '',
          soyad: '',
          babaad: '',
          anead: '',
          dogumtarih: '',
          aderss: '',
          basuruyil: new Date().getFullYear().toString(),
          sure: '1yıl',
          baslangicTarih: '',
          bitisTarih: ''
        });
        setPreview('');
      } else {
        const error = await formResponse.json();
        alert(error.message || 'Form gönderiminde hata oluştu');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Form gönderiminde hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <div className="form-container">
      <h2>Başvuru Formu</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fotoğraf:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
              <p className="image-info">
                <small>Resim önizlemesi - PDF'te görünecek</small>
              </p>
            </div>
          )}
          <p className="form-help">
            Lütfen passport fotoğrafı yükleyin (Max: 2MB)
          </p>
        </div>

        <div className="form-group">
          <label>Ad:</label>
          <input
            type="text"
            name="ad"
            value={formData.ad}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Soyad:</label>
          <input
            type="text"
            name="soyad"
            value={formData.soyad}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Baba Adı:</label>
          <input
            type="text"
            name="babaad"
            value={formData.babaad}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Anne Adı:</label>
          <input
            type="text"
            name="anead"
            value={formData.anead}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Doğum Tarihi:</label>
          <input
            type="date"
            name="dogumtarih"
            value={formData.dogumtarih}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Adres:</label>
          <textarea
            name="aderss"
            value={formData.aderss}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Başvuru Yılı:</label>
          <input
            type="number"
            name="basuruyil"
            value={formData.basuruyil}
            onChange={handleChange}
            required
            min="2000"
            max="2030"
          />
        </div>

        <div className="form-group">
          <label>Süre:</label>
          <select 
            name="sure" 
            value={formData.sure} 
            onChange={handleSureChange}
            required
          >
            <option value="1yıl">1 Yıl</option>
            <option value="2yıl">2 Yıl</option>
          </select>
        </div>

        <div className="form-group">
          <label>Başlangıç Tarihi:</label>
          <input
            type="date"
            name="baslangicTarih"
            value={formData.baslangicTarih}
            onChange={handleBaslangicTarihChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Bitiş Tarihi:</label>
          <input
            type="date"
            name="bitisTarih"
            value={formData.bitisTarih}
            readOnly
            className="readonly-input"
          />
          <small className="form-help">Bitiş tarihi otomatik hesaplanır</small>
        </div>

        <button className='btn' type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>

      {/* Başarılı Popup */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Başvuru Başarılı!</h3>
              <button className="popup-close" onClick={closePopup}>×</button>
            </div>
            <div className="popup-body">
              <div className="success-info">
                <p><strong>Ad Soyad:</strong> {successData.ad} {successData.soyad}</p>
                <div className="custom-id-section">
                  <strong>ID:</strong> 
                  <div className="id-container">
                    <span className="custom-id">{successData.customId}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(successData.customId)}
                      title="ID'yi kopyala"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
              <div className="popup-actions">
                <button className="btn btn-primary" onClick={closePopup}>
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .popup-content {
          background: white;
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 400px;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e5e5;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }

        .popup-header h3 {
          margin: 0;
          color: #28a745;
        }

        .popup-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }

        .popup-close:hover {
          color: #495057;
        }

        .popup-body {
          padding: 20px;
        }

        .success-info {
          margin-bottom: 20px;
        }

        .success-info p {
          margin: 10px 0;
          font-size: 16px;
        }

        .custom-id-section {
          margin: 15px 0;
        }

        .id-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 5px;
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #e5e5e5;
          border-radius: 4px;
        }

        .custom-id {
          font-family: monospace;
          font-size: 14px;
          flex: 1;
        }

        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .copy-btn:hover {
          background-color: #e9ecef;
        }

        .popup-actions {
          display: flex;
          justify-content: flex-end;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}