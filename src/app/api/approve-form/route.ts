import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { formId } = await request.json();
    
    const form = db.forms.update(Number(formId), {
      status: 'approved',
      approvedAt: new Date().toISOString()
    });

    if (!form) {
      return NextResponse.json(
        { message: 'Form bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Form başarıyla onaylandı',
      form: form
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}