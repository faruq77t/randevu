import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    

    if (!password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Parola gerekli' 
      }, { status: 400 });
    }

    // MD5 hash hesapla
    const hash = crypto.createHash('md5').update(password).digest('hex');
    const correctHash = 'c92a10324374fac681719d63979d00fe';



    if (hash === correctHash) {
      return NextResponse.json({ 
        success: true,
        message: 'Giriş başarılı'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Hatalı parola' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('❌ API hatası:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Sunucu hatası' 
    }, { status: 500 });
  }
}