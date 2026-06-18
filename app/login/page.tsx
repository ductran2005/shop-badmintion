'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ClipboardList,
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';

type AuthMode = 'login' | 'register';

type DemoAccount = {
  identifier: string;
  name: string;
  password: string;
};

const DEMO_ACCOUNTS_KEY = 'vietbad_demo_accounts';

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

const isValidIdentifier = (value: string) => {
  const trimmed = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^(0|\+84)\d{8,10}$/;

  return emailPattern.test(trimmed) || phonePattern.test(trimmed.replace(/\s/g, ''));
};

const readDemoAccounts = (): DemoAccount[] => {
  try {
    const rawAccounts = window.localStorage.getItem(DEMO_ACCOUNTS_KEY);
    return rawAccounts ? JSON.parse(rawAccounts) : [];
  } catch {
    return [];
  }
};

const saveDemoAccounts = (accounts: DemoAccount[]) => {
  window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isRegistering = mode === 'register';
  const title = isRegistering ? 'Tạo tài khoản' : 'Đăng nhập tài khoản';
  const subtitle = isRegistering
    ? 'Tạo tài khoản VietBad Store để mua hàng nhanh hơn'
    : 'Chào mừng bạn trở lại VietBad Store';
  const submitLabel = isRegistering ? 'Tạo tài khoản' : 'Đăng nhập';

  const switchPrompt = useMemo(
    () => (isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'),
    [isRegistering]
  );

  const switchLabel = useMemo(
    () => (isRegistering ? 'Đăng nhập ngay' : 'Tạo tài khoản ngay'),
    [isRegistering]
  );

  const resetFormFeedback = () => {
    setErrorMessage('');
  };

  const toggleMode = () => {
    setMode((currentMode) => (currentMode === 'login' ? 'register' : 'login'));
    setIdentifier('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setShowPassword(false);
    setErrorMessage('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedIdentifier = normalizeIdentifier(identifier);
    const trimmedName = fullName.trim();

    if (!isValidIdentifier(identifier)) {
      setErrorMessage('Vui lòng nhập email hoặc số điện thoại hợp lệ.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }

    if (isRegistering) {
      if (trimmedName.length < 2) {
        setErrorMessage('Vui lòng nhập họ tên của bạn.');
        return;
      }

      if (confirmPassword !== password) {
        setErrorMessage('Mật khẩu xác nhận chưa khớp.');
        return;
      }

      const accounts = readDemoAccounts();
      if (accounts.some((account) => account.identifier === normalizedIdentifier)) {
        setErrorMessage('Tài khoản này đã tồn tại. Vui lòng đăng nhập.');
        return;
      }

      saveDemoAccounts([
        ...accounts,
        {
          identifier: normalizedIdentifier,
          name: trimmedName,
          password,
        },
      ]);
      window.localStorage.setItem('vietbad_demo_session', normalizedIdentifier);
      router.push('/');
      return;
    }

    const accounts = readDemoAccounts();
    const matchedAccount = accounts.find((account) => account.identifier === normalizedIdentifier);

    if (matchedAccount && matchedAccount.password !== password) {
      setErrorMessage('Email/số điện thoại hoặc mật khẩu chưa đúng.');
      return;
    }

    window.localStorage.setItem('vietbad_demo_session', normalizedIdentifier);
    router.push('/');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      <div className="bg-brand-blue px-4 py-2 text-center">
        <p className="flex flex-wrap items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-white">
          <span>🔥</span>
          FREESHIP ĐƠN TỪ 499K - ĐAN VỢT LẤY NGAY TRONG NGÀY - CĂNG CHUẨN BẰNG MÁY ĐIỆN TỬ CHÂU Á!
        </p>
      </div>

      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-20 w-full max-w-[1536px] items-center justify-between gap-5 px-4 md:px-6 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center text-2xl font-black tracking-tighter md:text-3xl">
            <span className="text-brand-blue">VIETBAD</span>
            <span className="text-brand-yellow">STORE</span>
          </Link>

          <label className="relative hidden w-full max-w-xl md:block">
            <span className="sr-only">Tìm kiếm sản phẩm</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Tìm kiếm vợt, giày, phụ kiện cầu lông..."
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-12 pr-5 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
            />
          </label>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href="tel:0909999999"
              className="hidden items-center gap-2 rounded-full bg-brand-yellow px-4 py-2 text-left text-xs font-black text-gray-950 transition hover:bg-brand-yellow-hover sm:flex"
            >
              <Phone className="h-4 w-4" />
              <span>
                <span className="block text-[9px] uppercase leading-none">Tư vấn mua hàng</span>
                <span className="block leading-tight">0909 999 999</span>
              </span>
            </a>

            <Link
              href="/"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 sm:flex"
              aria-label="Lịch sử mua hàng"
            >
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 sm:flex"
              aria-label="Đăng nhập"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-hover"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-black text-gray-950">
                1
              </span>
            </Link>
          </div>
        </div>

        <nav className="border-t border-gray-100 bg-white">
          <div className="mx-auto flex w-full max-w-[1536px] items-center justify-start gap-7 overflow-x-auto px-4 py-3 text-[11px] font-black uppercase tracking-wider text-gray-700 [scrollbar-width:none] md:justify-center md:gap-12 md:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden">
            <Link href="/" className="shrink-0 transition hover:text-brand-blue">Trang chủ</Link>
            <Link href="/#categories-section" className="shrink-0 transition hover:text-brand-blue">Sản phẩm</Link>
            <Link href="/best-sellers" className="shrink-0 transition hover:text-brand-blue">Khuyến mãi cực hot</Link>
            <Link href="/racket-stringing" className="shrink-0 transition hover:text-brand-blue">Dịch vụ đan vợt</Link>
            <Link href="/contact" className="shrink-0 transition hover:text-brand-blue">Liên hệ tư vấn</Link>
          </div>
        </nav>
      </header>

      <section className="relative min-h-[calc(100vh-145px)] overflow-hidden bg-[#d8e9ff]">
        <Image
          src="/banner/login-background.png"
          alt="Khuyến mãi cầu lông VietBad Store"
          fill
          priority
          sizes="100vw"
          className="object-contain object-left-bottom"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,41,105,0.04)_0%,rgba(255,255,255,0)_46%,rgba(232,242,255,0.82)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-145px)] w-full max-w-[1536px] items-center justify-end px-4 py-10 md:px-8 lg:px-16">
          <div className="w-full max-w-[500px] rounded-xl bg-white/96 px-7 py-6 shadow-2xl shadow-blue-950/25 ring-1 ring-blue-100 backdrop-blur md:px-9">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-black uppercase tracking-tight text-brand-blue md:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm font-semibold text-gray-500">
                {subtitle}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegistering && (
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-bold text-gray-800">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) => {
                        setFullName(event.target.value);
                        resetFormFeedback();
                      }}
                      placeholder="Nhập họ tên của bạn"
                      autoComplete="name"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 text-sm font-semibold outline-none transition placeholder:font-medium placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="identifier" className="mb-2 block text-sm font-bold text-gray-800">
                  Email hoặc số điện thoại
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      resetFormFeedback();
                    }}
                    placeholder="Nhập email hoặc số điện thoại của bạn"
                    autoComplete={isRegistering ? 'username' : 'username'}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 text-sm font-semibold outline-none transition placeholder:font-medium placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-bold text-gray-800">
                  Mật khẩu
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      resetFormFeedback();
                    }}
                    placeholder="Nhập mật khẩu"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-12 text-sm font-semibold outline-none transition placeholder:font-medium placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-brand-blue"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-gray-800">
                    Nhập lại mật khẩu
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        resetFormFeedback();
                      }}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 text-sm font-semibold outline-none transition placeholder:font-medium placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <label className="inline-flex items-center gap-2 font-semibold text-gray-600">
                  <input defaultChecked type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-brand-blue" />
                  Ghi nhớ đăng nhập
                </label>
                {!isRegistering && (
                  <a href="#" className="font-black text-brand-blue hover:underline">
                    Quên mật khẩu?
                  </a>
                )}
              </div>

              {errorMessage && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" aria-live="polite">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-brand-yellow text-sm font-black uppercase text-gray-950 shadow-lg shadow-yellow-500/25 transition hover:-translate-y-0.5 hover:bg-brand-yellow-hover"
              >
                {submitLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {!isRegistering && (
              <>
                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-semibold text-gray-400">Hoặc</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 transition hover:border-brand-blue hover:text-brand-blue"
                  >
                    <span className="text-lg font-black text-[#4285f4]">G</span>
                    Đăng nhập với Google
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 transition hover:border-brand-blue hover:text-brand-blue"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] text-sm font-black text-white">f</span>
                    Đăng nhập với Facebook
                  </button>
                </div>
              </>
            )}

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <span className="text-sm font-semibold text-gray-600">
                {switchPrompt}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="h-10 w-full rounded-lg border-2 border-brand-blue px-4 text-sm font-black uppercase text-brand-blue transition hover:bg-brand-blue hover:text-white sm:w-auto sm:min-w-52 sm:px-6"
              >
                {switchLabel}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
