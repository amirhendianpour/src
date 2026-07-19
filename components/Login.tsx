import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (token: string, identifier: string) => void;
  onSwitchToRegister: () => void; // این خط اضافه شود
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess ,onSwitchToRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // یک اعتبارسنجی ساده برای خالی نبودن فیلد
    if (!phoneNumber.trim()) {
      setError('لطفاً شماره موبایل خود را وارد کنید.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ارسال دقیقاً همان ساختاری که بک‌اند شما نیاز دارد
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        
        const token = data.token || data.accessToken; 
        
        if (token) {
          onLoginSuccess(token, data.username);
        } else {
          setError('ورود موفق بود اما توکنی از سمت سرور دریافت نشد!');
        }
      } else {
        // اگر استاتوس کد 4xx یا 5xx بود
        setError('ورود ناموفق بود. لطفاً شماره موبایل را بررسی کنید.');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور. مطمئن شوید بک‌اند Spring Boot روشن است.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-lg">
            💬
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ورود به پیام‌رسان</h1>
          <p className="text-gray-500 mt-2 text-sm">شماره موبایل خود را برای ورود وارد کنید</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">شماره موبایل</label>
            <input 
              type="tel" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-left"
              placeholder="+989120000000"
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? 'در حال ارتباط با سرور...' : 'ورود'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          حساب کاربری ندارید؟{' '}
          <button 
            onClick={onSwitchToRegister} 
            className="text-blue-500 font-bold hover:underline focus:outline-none" >
            ثبت‌نام کنید
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;