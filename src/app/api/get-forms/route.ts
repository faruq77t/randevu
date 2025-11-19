import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const forms = db.forms.findAll();
    
    
    return NextResponse.json({ 
      success: true,
      forms: forms || [] // Emin olmak için boş array dön
    });
  } catch (error) {
    console.error('Error in get-forms:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Sunucu hatası',
        forms: [] // Hata durumunda boş array
      },
      { status: 500 }
    );
  }
}