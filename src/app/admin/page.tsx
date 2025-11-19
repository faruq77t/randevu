'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  id: number;
  customId: string;
  ad: string;
  soyad: string;
  basuruyil: string;
  sure: string;
  status: string;
}

export default function AdminPage() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Auth kontrolü - useEffect içinde düzgün yapılandırma
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = localStorage.getItem('adminAuthenticated');
        const loginTime = localStorage.getItem('adminLoginTime');
        

        
        if (authenticated && loginTime) {
          const timeDiff = Date.now() - parseInt(loginTime);
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          

          
          if (hoursDiff < 24) {
            setAuthLoading(false);
            fetchForms();
          } else {
            // Session süresi dolmuş

            localStorage.removeItem('adminAuthenticated');
            localStorage.removeItem('adminLoginTime');
            router.push('/admin-login');
          }
        } else {

          router.push('/admin-login');
        }
      } catch (error) {
        console.error('❌ Auth kontrol hatası:', error);
        router.push('/admin-login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchForms = async () => {
    try {
  
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/get-forms');

      
      const data = await response.json();


      if (data.success && Array.isArray(data.forms)) {
        setForms(data.forms);

      } else {
        const errorMsg = data.message || 'Başvurular yüklenirken hata oluştu';
        setError(errorMsg);
        setForms([]);
        console.error('❌ Form yükleme hatası:', errorMsg);
      }
    } catch (error) {
      console.error('❌ Bağlantı hatası:', error);
      setError('Bağlantı hatası oluştu. API endpointini kontrol edin.');
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const approveForm = async (formId: number) => {
    if (!confirm('Bu formu onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
    
      
      const response = await fetch('/api/approve-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formId }),
      });

      const result = await response.json();
   

      if (response.ok) {
        alert('✅ Form başarıyla onaylandı!');
        fetchForms(); // Listeyi yenile
      } else {
        alert(`❌ Onaylama başarısız: ${result.message || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('❌ Onaylama hatası:', error);
      alert('❌ Onaylama sırasında hata oluştu');
    }
  };

  const downloadPDF = async (formId: number, customId: string) => {
    try {
    
      
      const response = await fetch(`/api/generate-pdf?formId=${encodeURIComponent(customId)}`);
      
     
      
      if (response.ok) {
        const htmlContent = await response.text();
   
        
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Başvuru Formu - ${customId}</title>
              <style>
                body { 
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                }
              </style>
              <script>
                window.onload = function() {

                  window.print();
                  
                  setTimeout(function() {
                    const shouldClose = confirm('Yazdırma tamamlandı mı?');
                    if (shouldClose) {
                      window.close();
                    }
                  }, 1000);
                };
                
                // ESC tuşu ile kapatma
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape') {
                    window.close();
                  }
                });
              </script>
            </head>
            <body>
              ${htmlContent}
            </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          alert('❌ Pencere açılamadı. Lütfen pop-up engelleyicinizi kapatın ve tekrar deneyin.');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ PDF oluşturma hatası:', errorText);
        alert('❌ PDF oluşturulamadı: ' + (errorText || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('❌ PDF hatası:', error);
      alert('❌ PDF oluşturma başarısız: ' + error);
    }
  };

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminLoginTime');
      router.push('/admin-login');
    }
  };

  // Auth yükleniyor
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>🔐 Yetki kontrol ediliyor...</h2>
        <p>Lütfen bekleyin...</p>
      </div>
    );
  }

  // Veri yükleniyor
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>📋 Başvurular Yükleniyor...</h2>
        <p>Bu işlem birkaç saniye sürebilir</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Hata Oluştu</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={fetchForms} className="btn-primary">
            🔄 Tekrar Dene
          </button>
          <button onClick={() => router.push('/admin-login')} className="btn-secondary">
            🔐 Yeniden Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>👨‍💼 Admin Panel</h1>
          <p>Başvuru Yönetim Sistemi</p>
        </div>
        <div className="admin-actions">
          <button onClick={fetchForms} className="refresh" title="Listeyi yenile">
             Yenile
          </button>
          <button onClick={handleLogout} className="logout" title="Çıkış yap">
             Çıkış
          </button>
        </div>
      </div>
      
      {!forms || forms.length === 0 ? (
        <div className="no-forms">
          <div className="no-forms-icon">📭</div>
          <h3>Henüz başvuru bulunmamaktadır.</h3>
          <p>Kullanıcıların form göndermesini bekleyin veya API endpointlerini kontrol edin.</p>
          <button onClick={fetchForms} className="btn-primary">
            🔄 Kontrol Et
          </button>
        </div>
      ) : (
        <div className="admin-content">
          <div className="table-info">
            <span>📊 Toplam <strong>{forms.length}</strong> başvuru bulundu</span>
            <span className="status-summary">
              ✅ Onaylanan: {forms.filter(f => f.status === 'approved').length} | 
              ⏳ Bekleyen: {forms.filter(f => f.status === 'pending').length}
            </span>
          </div>
          
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad Soyad</th>
                  <th>Başvuru Yılı</th>
                  <th>Süre</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="form-row">
                    <td className="form-id">
                      <strong>{form.customId}</strong>
                    </td>
                    <td className="form-name">
                      {form.ad} {form.soyad}
                    </td>
                    <td className="form-year">
                      {form.basuruyil}
                    </td>
                    <td className="form-duration">
                      {form.sure === '1yıl' ? '1 Yıl' : '2 Yıl'}
                    </td>
                    <td className="form-status">
                      <span className={`status-badge ${form.status}`}>
                        {form.status === 'pending' ? '⏳ Bekliyor' : '✅ Onaylandı'}
                      </span>
                    </td>
                    <td className="form-actions">
                      {/* Tüm formlar için Yazdır butonu göster */}
                      <button
                        onClick={() => downloadPDF(form.id, form.customId)}
                        className="btn-download"
                        title="PDF olarak yazdır"
                      >
                        🖨️ Yazdır
                      </button>
                      
                      {/* Sadece bekleyen formlar için Onayla butonu göster */}
                      {form.status === 'pending' && (
                        <button
                          onClick={() => approveForm(form.id)}
                          className="btn-approve"
                          title="Formu onayla"
                        >
                          ✅ Onayla
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 1200px;
          margin: 50px auto;
          min-height: 100vh;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding: 25px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .admin-title h1 {
          color: #2c5aa0;
          margin: 0 0 8px 0;
          font-size: 28px;
        }

        .admin-title p {
          color: #666;
          margin: 0;
          font-size: 16px;
        }

        .admin-actions {
          display: flex;
          gap: 12px;
        }


     .logout, .refresh{
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .refresh {
          background: #28a745;
          color: white;
        }

        .refresh:hover {
          background: #218838;
          transform: translateY(-2px);
        }

        .logout{
          background: #dc3545;
          color: white;
        }

        .logout:hover {
          background: #c82333;
          transform: translateY(-2px);
        }

        .no-forms {
          text-align: center;
          padding: 80px 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .no-forms-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .no-forms h3 {
          color: #495057;
          margin-bottom: 12px;
        }

        .no-forms p {
          color: #6c757d;
          margin-bottom: 25px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .admin-content {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .table-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          font-weight: 600;
          color: #495057;
        }

        .status-summary {
          font-size: 14px;
          color: #6c757d;
        }

        .table-container {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        th {
          background: #2c5aa0;
          color: white;
          padding: 16px 20px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }

        td {
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .form-row:hover {
          background: #f8f9fa;
        }

        .form-id {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #495057;
        }

        .form-name {
          font-weight: 600;
          color: #212529;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .status-badge.approved {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-approve, .btn-download {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-approve {
          background: #28a745;
          color: white;
        }

        .btn-approve:hover {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-download {
          background: #17a2b8;
          color: white;
        }

        .btn-download:hover {
          background: #138496;
          transform: translateY(-1px);
        }

        .loading-container, .error-container {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 500px;
          margin: 50px auto;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2c5aa0;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 25px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 25px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .admin-actions {
            justify-content: center;
          }

          .table-info {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-approve, .btn-download {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}