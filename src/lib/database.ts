import { FormData } from '@/types/form';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

const readDB = (): { forms: FormData[] } => {
  try {
    // db.json dosyasının var olduğundan emin ol
    if (!fs.existsSync(dbPath)) {
      // Dosya yoksa, boş bir structure oluştur
      const initialData = { forms: [] };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const data = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(data);
    
    // forms array'inin var olduğundan emin ol
    return {
      forms: Array.isArray(parsed.forms) ? parsed.forms : []
    };
  } catch (error) {
    console.error('Error reading DB:', error);
    return { forms: [] }; // Hata durumunda boş array
  }
};

const writeDB = (data: { forms: FormData[] }) => {
  try {
    // Klasörün var olduğundan emin ol
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to DB:', error);
  }
};

export const db = {
  forms: {
    create: (formData: Omit<FormData, 'id' | 'createdAt'>): FormData => {
      const dbData = readDB();
      const newId = dbData.forms.length > 0 
        ? Math.max(...dbData.forms.map(f => f.id || 0)) + 1 
        : 1;
      
      const form: FormData = {
        id: newId,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      dbData.forms.push(form);
      writeDB(dbData);
      return form;
    },
    
    findAll: (): FormData[] => {
      const dbData = readDB();
      return dbData.forms || []; // Emin olmak için
    },
    
    findById: (id: number): FormData | undefined => {
      const dbData = readDB();
      return (dbData.forms || []).find(form => form.id === id);
    },
    
    update: (id: number, updates: Partial<FormData>): FormData | null => {
      const dbData = readDB();
      const index = (dbData.forms || []).findIndex(form => form.id === id);
      
      if (index !== -1) {
        dbData.forms[index] = { ...dbData.forms[index], ...updates };
        writeDB(dbData);
        return dbData.forms[index];
      }
      return null;
    }
  }
};