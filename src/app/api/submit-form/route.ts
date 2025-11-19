import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { generateCustomId } from '@/lib/idGenerator';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    

    // Generate custom ID
    const customId = generateCustomId(new Date().getFullYear());
    
    const form = db.forms.create({
      ...formData,
      customId,
      status: 'pending',
    });


    
    return NextResponse.json({ 
      message: 'Form başarıyla gönderildi', 
      formId: form.id,
      customId: customId
    });
  } catch (error) {
    console.error('❌ Error in submit-form:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}