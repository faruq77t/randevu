'use client';

import { useState } from 'react';
import UserForm from '@/components/UserForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('yeni');

  return (
    <main className="main-container">
      <div className="header">
        <h1>🎓 Eğitim Başvuru Sistemi</h1>
        <p>Kurs programına başvurun ve durumunuzu takip edin</p>
        
        <div className="tab-buttons">
          <button
            onClick={() => setActiveTab('yeni')}
            className={`tab-btn ${activeTab === 'yeni' ? 'active' : ''}`}
          >
            📝 Yeni Başvuru
          </button>

            <button 
              onClick={() => window.location.href = '/basvuru-sorgula'}
              className="redirect-btn"
            >
              📋 Başvuru Sorgula
            </button>

          <button
            onClick={() => window.location.href = '/admin'}
            className="tab-btn admin-btn"
          >
            👨‍💼 Admin
          </button>
        </div>
      </div>

      {activeTab === 'yeni' && <UserForm />}    
    
    </main>
  );
}