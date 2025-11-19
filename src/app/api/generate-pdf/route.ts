import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');


    if (!formId) {
      return NextResponse.json({ message: 'Form ID gerekli' }, { status: 400 });
    }

    // Tüm formları al
    const forms = db.forms.findAll();

    let form;

    // Önce customId ile ara
    form = forms.find(f => f.customId === formId);
    
    // Eğer customId ile bulamadıysa ve sayısal ise id ile ara
    if (!form && /^\d+$/.test(formId)) {
      const numericId = parseInt(formId);
      form = forms.find(f => f.id === numericId);
    }

    
    if (!form) {
      return NextResponse.json(
        { message: `"${formId}" ID'li form bulunamadı` },
        { status: 404 }
      );
    }

    // ADMIN İZİN KONTROLÜ - Form onaylanmamış olsa bile PDF oluşturulabilir
    // Burada admin kontrolü yapabilirsiniz, örneğin:
    // const isAdmin = request.headers.get('authorization') === 'admin-token'
    // Şimdilik tüm isteklere izin veriyoruz


    // RESİM URL'SİNİ HAZIRLA
    let imageUrl = '';
    if (form.img) {
      // Eğer resim base64 ise direkt kullan
      if (form.img.startsWith('data:')) {
        imageUrl = form.img;
      } else {
        // Değilse tam URL'yi oluştur
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        imageUrl = form.img.startsWith('/') ? `${baseUrl}${form.img}` : form.img;
      }
    }

    // DURUM BADGE'İ
    const statusBadge = form.status === 'approved' 
      ? '<span class="approved-badge">✅ ONAYLANDI</span>'
      : '<span class="pending-badge">⏳ ONAY BEKLİYOR</span>';

    // RESİM HTML İÇERİĞİ
    const userImage = form.img ? `
      <div class="photo-section">
        <div class="photo-frame">
          <img 
            src="${imageUrl}" 
            alt="Başvuru Fotoğrafı" 
            class="user-photo"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
          />
          <div class="photo-error" style="display: none;">
            <p>❌ Fotoğraf yüklenemedi</p>
          </div>
        </div>
        <p class="photo-label">Başvuru Fotoğrafı</p>
      </div>
    ` : `
      <div class="photo-section">
        <div class="no-photo">
          <p>📷 Fotoğraf Yok</p>
        </div>
        <p class="photo-label">Başvuru Fotoğrafı</p>
      </div>
    `;

    // HTML PDF oluştur
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Başvuru Formu - ${form.customId}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: auto;
            padding: 40px;
            color: #242424ff;
            line-height: 1.6;
            max-width: 900px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2c5aa0;
            margin: 0;
            font-size: 28px;
          }
          .content-wrapper {
            display: flex;
            gap: 30px;
            margin-bottom: 20px;
          }
          .photo-column {
            flex: 0 0 200px;
          }
          .info-column {
            flex: 1;
          }
          .form-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .label {
            font-weight: bold;
            width: 150px;
            color: #495057;
          }
          .value {
            flex: 1;
            color: #212529;
          }
          .approved-badge {
            background: #28a745;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
          }
          .pending-badge {
            background: #ffc107;
            color: #856404;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
          }
          .signature {
            margin-top: 10px;
            text-align: right;
            border-top: 1px solid #ccc;
            padding-top: 20px;
          }
          
          /* Fotoğraf Stilleri */
          .photo-section {
            text-align: center;
            margin-bottom: 20px;
          }
          .photo-frame {
            display: inline-block;
            border: 3px solid #2c5aa0;
            padding: 10px;
            border-radius: 8px;
            background: white;
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .user-photo {
            max-width: 150px;
            max-height: 150px;
            border-radius: 4px;
            display: block;
          }
          .no-photo {
            padding: 20px;
            color: #6c757d;
            font-style: italic;
          }
          .photo-label {
            margin-top: 8px;
            font-size: 14px;
            color: #666;
            font-weight: bold;
          }
          .photo-error {
            color: #dc3545;
            font-size: 12px;
          }
          
          .admin-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-size: 12px;
            color: #856404;
          }
          
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .content-wrapper {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BAŞVURU FORMU</h1>
          <p>Eğitim Programı Başvuru Belgesi</p>
          ${form.status !== 'approved' ? `
            <div class="admin-note">
              <strong>ADMIN ÖNİZLEME:</strong> Bu form henüz onaylanmamıştır.
            </div>
          ` : ''}
        </div>

        <div class="content-wrapper">
          <!-- SOL SÜTUN - FOTOĞRAF -->
          <div class="photo-column">
            ${userImage}
          </div>
          
          <!-- SAĞ SÜTUN - BİLGİLER -->
          <div class="info-column">
            <div class="form-info">
              <div class="info-row">
                <span class="label">Başvuru ID:</span>
                <span class="value"><strong>${form.customId}</strong></span>
              </div>
              <div class="info-row">
                <span class="label">Ad Soyad:</span>
                <span class="value">${form.ad} ${form.soyad}</span>
              </div>
              <div class="info-row">
                <span class="label">Baba Adı:</span>
                <span class="value">${form.babaad}</span>
              </div>
              <div class="info-row">
                <span class="label">Anne Adı:</span>
                <span class="value">${form.anead}</span>
              </div>
              <div class="info-row">
                <span class="label">Doğum Tarihi:</span>
                <span class="value">${new Date(form.dogumtarih).toLocaleDateString('tr-TR')}</span>
              </div>
              <div class="info-row">
                <span class="label">Başvuru Yılı:</span>
                <span class="value">${form.basuruyil}</span>
              </div>
              <div class="info-row">
                <span class="label">Eğitim Süresi:</span>
                <span class="value">${form.sure === '1yıl' ? '1 Yıl' : '2 Yıl'}</span>
              </div>
              <div class="info-row">
                <span class="label">Başlangıç Tarihi:</span>
                <span class="value">${new Date(form.baslangicTarih).toLocaleDateString('tr-TR')}</span>
              </div>
              <div class="info-row">
                <span class="label">Bitiş Tarihi:</span>
                <span class="value">${new Date(form.bitisTarih).toLocaleDateString('tr-TR')}</span>
              </div>
              <div class="info-row">
                <span class="label">Adres:</span>
                <span class="value">${form.aderss}</span>
              </div>
              <div class="info-row">
                <span class="label">Durum:</span>
                <span class="value">
                  ${statusBadge}
                </span>
              </div>
              ${form.approvedAt ? `
              <div class="info-row">
                <span class="label">Onaylanma Tarihi:</span>
                <span class="value">${new Date(form.approvedAt).toLocaleDateString('tr-TR')}</span>
              </div>
              ` : ''}
              ${form.status !== 'approved' ? `
              <div class="info-row">
                <span class="label">Oluşturulma Tarihi:</span>
                <span class="value">${new Date(form.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="signature">
          <p>İmza: _________________________</p>
          <p>Tarih: _________________________</p>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>Bu belgeyi yazdırmak için tarayıcınızın yazdırma özelliğini kullanın (Ctrl+P)</p>
          ${form.status !== 'approved' ? `
            <p style="color: #ffc107; font-weight: bold;">⚠️ Bu form henüz onaylanmamıştır - ADMIN ÖNİZLEME</p>
          ` : ''}
        </div>

        <script>
          // Resim yükleme hatalarını yakala
          document.addEventListener('DOMContentLoaded', function() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
              img.addEventListener('error', function() {
                this.style.display = 'none';
                const errorDiv = this.nextElementSibling;
                if (errorDiv && errorDiv.classList.contains('photo-error')) {
                  errorDiv.style.display = 'block';
                }
              });
            });
          });
        </script>
      </body>
      </html>
    `;

    
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
    
  } catch (error) {
    console.error('❌ PDF oluşturma hatası:', error);
    return NextResponse.json(
      { message: 'PDF oluşturma hatası' },
      { status: 500 }
    );
  }
}