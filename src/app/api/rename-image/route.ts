import { NextRequest, NextResponse } from 'next/server';
import { rename, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { customId, oldImageUrl } = await request.json();

    if (!customId || !oldImageUrl) {
      return NextResponse.json(
        { message: 'customId ve oldImageUrl gerekli' },
        { status: 400 }
      );
    }

    // Eski dosya yolunu bul
    const oldFileName = path.basename(oldImageUrl);
    const oldFilePath = path.join(process.cwd(), 'public', 'images', 'forms', oldFileName);

    // Yeni dosya adını ve yolunu oluştur
    const fileExtension = path.extname(oldFileName) || '.jpg';
    const newFileName = `${customId}${fileExtension}`;
    const newFilePath = path.join(process.cwd(), 'public', 'images', 'forms', newFileName);

    try {
      // Dosyayı yeniden adlandır
      await rename(oldFilePath, newFilePath);

    } catch (error) {
      console.error('❌ Yeniden adlandırma hatası, eski dosya siliniyor:', error);
      // Eski dosyayı sil
      await unlink(oldFilePath);
      return NextResponse.json(
        { message: 'Resim işlenirken hata oluştu' },
        { status: 500 }
      );
    }

    const newImageUrl = `/images/forms/${newFileName}`;

    return NextResponse.json({ 
      success: true, 
      newImageUrl 
    });

  } catch (error) {
    console.error('❌ Resim yeniden adlandırma hatası:', error);
    return NextResponse.json(
      { message: 'Resim yeniden adlandırma hatası' },
      { status: 500 }
    );
  }
}