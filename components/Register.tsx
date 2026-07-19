import React, { useState } from 'react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !phoneNumber.trim()) {
      setError('لطفاً نام کاربری و شماره موبایل را وارد کنید.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ارسال دیتا دقیقاً مطابق با Entity بک‌اند
        body: JSON.stringify({ 
            username: username.trim(), 
            phoneNumber: phoneNumber.trim() 
        })
      });

      if (response.ok) {
        setSuccess('ثبت‌نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.');
        // پاک کردن فرم پس از موفقیت
        setUsername('');
        setPhoneNumber('');
        // هدایت خودکار به صفحه ورود پس از ۲ ثانیه
        setTimeout(() => {
            onSwitchToLogin();
        }, 2000);
      } else {
        const errorMsg = await response.text();
        setError(`خطا در ثبت‌نام: ${errorMsg}`);
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور. مطمئن شوید بک‌اند روشن است.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-lg">
            ✨
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ثبت‌نام در پیام‌رسان</h1>
          <p className="text-gray-500 mt-2 text-sm">حساب کاربری جدید خود را بسازید</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">نام کاربری (انگلیسی)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-left"
              placeholder="e.g. Amir"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">شماره موبایل</label>
            <input 
              type="tel" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-left"
              placeholder="+989120000000"
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all ${
              isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? 'در حال ثبت اطلاعات...' : 'ثبت‌نام'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <button 
            onClick={onSwitchToLogin} 
            className="text-blue-500 font-bold hover:underline focus:outline-none"
          >
            وارد شوید
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;