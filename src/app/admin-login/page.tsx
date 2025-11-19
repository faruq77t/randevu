'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Giriş başarılı
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        router.push('/admin');
      } else {
        setError(data.message || '❌ Hatalı parola! Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      setError('Giriş sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Enter tuşu ile gönderme
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password && !loading) {
      handleLogin(e as any);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>🔐 Admin Girişi</h1>
          <p>Yönetim paneline erişmek için parolanızı girin</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="password">Parola:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Parolanızı girin..."
              required
              disabled={loading}
              className="password-input"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !password}
            className="login-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Giriş Yapılıyor...
              </>
            ) : (
              '🔐 Giriş Yap'
            )}
          </button>
        </form>

        <div className="login-info">
          <a href="/" className='home-link'>🏠 Ana Sayfaya Dön</a>
          <p><small>Bu hash değerine sahip parolayı girin</small></p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-form {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 400px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 24px;
        }

        .login-header p {
          color: #666;
          font-size: 14px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .password-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          box-sizing: border-box;
          font-family: monospace;
        }

        .password-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .password-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          border: 1px solid #fcc;
          font-size: 14px;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-btn:hover:not(:disabled) {
          background: #5a6fd8;
          transform: translateY(-1px);
        }

        .login-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-info {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #888;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }

        .login-info p {
          margin: 5px 0;
        }

        .login-info strong {
          color: #667eea;
        }
      `}</style>
    </div>
  );
}