export interface FormData {
  id?: number;
  customId: string;
  img?: string; // URL olarak
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
  status: 'pending' | 'approved';
  createdAt: string;
  approvedAt?: string;
}

export interface FormSubmission {
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