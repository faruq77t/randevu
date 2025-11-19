import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const customId = formData.get('customId') as string;

    if (!image || !customId) {
      return NextResponse.json(
        { message: 'Resim ve customId gerekli' },
        { status: 400 }
      );
    }

    // Resmi buffer'a çevir
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Klasör yolunu oluştur
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'forms');
    
    // Klasör yoksa oluştur
    try {
      await mkdir(imagesDir, { recursive: true });
    } catch (error) {
    }

    // Dosya adını customId ile oluştur
    const fileExtension = image.type.split('/')[1] || 'jpg';
    const fileName = `${customId}.${fileExtension}`;
    const filePath = path.join(imagesDir, fileName);

    // Resmi kaydet
    await writeFile(filePath, buffer);
    

    // Public URL'ini döndür
    const imageUrl = `/images/forms/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName 
    });

  } catch (error) {
    console.error('❌ Resim yükleme hatası:', error);
    return NextResponse.json(
      { message: 'Resim yükleme hatası' },
      { status: 500 }
    );
  }
}