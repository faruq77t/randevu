import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');


    if (!idParam) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Form ID gerekli' 
        },
        { status: 400 }
      );
    }

    const forms = db.forms.findAll();

    let form;

    // Önce customId ile ara (string olarak)
    form = forms.find(f => f.customId === idParam);
    
    // Eğer customId ile bulamadıysa ve sayısal ise id ile ara
    if (!form && /^\d+$/.test(idParam)) {
      const numericId = parseInt(idParam);
      form = forms.find(f => f.id === numericId);
    }

    
    if (!form) {
      return NextResponse.json(
        { 
          success: false,
          message: `"${idParam}" ID'li başvuru bulunamadı. Lütfen ID'nizi kontrol edin.` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      form 
    });
  } catch (error) {
    console.error('❌ Error in get-form API:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Sunucu hatası' 
      },
      { status: 500 }
    );
  }
}