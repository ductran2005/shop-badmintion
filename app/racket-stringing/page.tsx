"use client";

import React, { useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, CheckCircle2,
  Clock, Gauge, Home, MessageCircle, Phone, Search, ShieldCheck,
  Sparkles, User, Wrench,
} from 'lucide-react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { PRODUCTS, STRINGS, UTILS } from '../data';
import { CartItem, Order, Product, StringingBooking, Voucher } from '../types';

const serviceSteps = [
  { title: 'Kiểm tra khung', text: 'Soi nứt, lún gen, móp khung và tư vấn mức kg an toàn trước khi căng.' },
  { title: 'Chọn cước và số kg', text: 'Gợi ý cước bền, nảy hoặc kiểm soát theo lực tay và lối chơi của bạn.' },
  { title: 'Căng máy điện tử', text: 'Căng đều lực, đúng nút thắt, hạn chế lệch khung và giữ mặt vợt ổn định.' },
  { title: 'Bàn giao sau kiểm tra', text: 'Kiểm lại âm cước, mặt dây, gen và dán nhãn thông số để dễ theo dõi.' },
];

const servicePackages = [
  {
    id: 'standard',
    name: 'Căng cước tiêu chuẩn',
    price: 80000,
    priceLabel: 'Từ 80.000đ',
    detail: 'Phù hợp tập luyện hằng ngày, nhận trong ngày khi không quá tải.',
    features: ['Kiểm tra khung trước khi căng', 'Căng máy điện tử', 'Nhận trong ngày'],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Căng cước thi đấu',
    price: 120000,
    priceLabel: 'Từ 120.000đ',
    detail: 'Ưu tiên độ ổn định mặt dây, nút thắt gọn và kiểm tra kỹ sau căng.',
    features: ['Kiểm tra khung + tư vấn cước', 'Căng máy điện tử chuyên dụng', 'Kiểm tra kỹ sau căng', 'Dán nhãn thông số'],
    highlighted: true,
  },
  {
    id: 'grip',
    name: 'Thay gen / quấn cán',
    price: 30000,
    priceLabel: 'Từ 30.000đ',
    detail: 'Xử lý gen mòn, thay quấn cán và vệ sinh nhanh trước khi ra sân.',
    features: ['Thay gen mới', 'Quấn cán theo yêu cầu', 'Vệ sinh nhanh'],
    highlighted: false,
  },
];


const WIZARD_STEPS = ['Chọn cước', 'Số kg', 'Dịch vụ thêm', 'Thông tin', 'Xác nhận'];

const EXTRA_SERVICES = [
  { id: 'thay_gen', label: 'Thay gen', price: 15000, desc: 'Thay gen mới, hạn chế cước bị cứa khi đan.' },
  { id: 'quan_can', label: 'Quấn cán', price: 15000, desc: 'Quấn cán mới theo yêu cầu, cầm chắc tay hơn.' },
  { id: 've_sinh', label: 'Vệ sinh vợt', price: 10000, desc: 'Lau sạch khung, cán và gọn đầu cước thừa.' },
  { id: 'dan_nhan', label: 'Dán nhãn thông số', price: 0, desc: 'Ghi lại cước, số kg và ngày đan lên vợt. Miễn phí.' },
];

type BookingForm = {
  stringId: string;
  tension: string;
  extraServices: string[];
  name: string;
  phone: string;
  date: string;
  note: string;
};

const EMPTY_FORM: BookingForm = { stringId: '', tension: '', extraServices: [], name: '', phone: '', date: '', note: '' };

export default function RacketStringingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [vouchersApplied, setVouchersApplied] = useState<Voucher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Booking wizard — steps: 0=cước, 1=kg, 2=dịch vụ thêm, 3=info, 4=confirm
  const [wizardOpen, setWizardOpen] = useState(false);
  const [stringSearch, setStringSearch] = useState('');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const bookingRef = useRef<HTMLElement>(null);

  const stringingProducts = useMemo(() => {
    const accessories = PRODUCTS.filter((p) => p.category === 'accessories').slice(0, 8);
    const rackets = PRODUCTS.filter((p) => p.category === 'racket').slice(0, 4);
    return [...accessories, ...rackets];
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2800);
  };

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    setWishlist((prev) => exists ? prev.filter((i) => i.id !== product.id) : [...prev, product]);
    showToast(exists ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleAddToCart = (product: Product, quantity: number, tension?: string) => {
    const cartItemId = tension ? `${product.id}-${tension}` : product.id;
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === cartItemId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, { id: cartItemId, product, quantity, selectedTension: tension }];
    });
    showToast('Đã thêm sản phẩm vào giỏ hàng');
  };

  const handleAddToCartDirectly = (product: Product) => {
    if (product.category === 'racket') { setQuickViewProduct(product); return; }
    handleAddToCart(product, 1);
  };

  const openWizard = () => {
    setSubmitted(false);
    setForm(EMPTY_FORM);
    setStep(0);
    setStringSearch('');
    setWizardOpen(true);
    setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  };

  const selectedString = STRINGS.find((s) => s.id === form.stringId);

  const canNext = () => {
    if (step === 0) return !!form.stringId;
    if (step === 1) return !!form.tension && Number(form.tension) >= 9 && Number(form.tension) <= 14;
    if (step === 2) return true; // dịch vụ thêm optional
    if (step === 3) return form.name.trim().length >= 2 && /^[0-9]{9,11}$/.test(form.phone.trim()) && !!form.date;
    return true;
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    const booking: StringingBooking = {
      id: `BK${Date.now()}`,
      servicePackage: 'Đan vợt',
      stringId: form.stringId,
      stringName: selectedString?.name ?? '(không chọn)',
      tension: form.tension,
      customerName: form.name,
      customerPhone: form.phone,
      preferredDate: form.date,
      note: form.note,
      stringPrice: selectedString?.price ?? 0,
      servicePrice: 0,
      total: selectedString?.price ?? 0,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    console.info('New stringing booking:', booking);
    setSubmitted(true);
    showToast('Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận.');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => showToast('Danh sách yêu thích đang được lưu trên trang này')}
        onOpenOrders={() => showToast('Lịch sử đơn hàng đang ở trang chủ')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(categoryId) => { window.location.href = `/category/${categoryId}`; }}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-slate-950 text-white"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(4, 17, 38, 0.92), rgba(0, 91, 170, 0.58)), url("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1800&q=80")',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto grid min-h-[430px] max-w-[1536px] items-end gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
          <div>
            <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/85 hover:text-brand-yellow">
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-yellow">Dịch vụ đan vợt</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Căng cước chuẩn lực, nhận vợt tự tin ra sân</h1>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-blue-50 md:text-base">
              VietBad hỗ trợ kiểm tra khung, chọn cước, tư vấn số kg và căng bằng máy điện tử để mặt vợt ổn định hơn trong từng pha đánh.
            </p>
            <button
              onClick={() => openWizard()}
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-yellow px-6 py-3 text-sm font-black text-gray-950 shadow-lg transition hover:brightness-110"
            >
              <CalendarDays className="h-4 w-4" />
              Đặt lịch đan vợt ngay
            </button>
          </div>

          <div className="grid gap-3">
            {[
              { icon: Gauge, title: 'Căng đúng số kg', text: 'Tư vấn theo lực tay và thói quen đánh' },
              { icon: Clock, title: 'Nhận trong ngày', text: 'Áp dụng khi vợt và cước có sẵn tại shop' },
              { icon: ShieldCheck, title: 'Kiểm tra trước khi căng', text: 'Hạn chế rủi ro khung yếu hoặc gen mòn' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg border border-white/20 bg-white/12 p-4 backdrop-blur">
                <item.icon className="h-6 w-6 shrink-0 text-brand-yellow" />
                <div>
                  <h2 className="text-sm font-black uppercase">{item.title}</h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/80">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1536px] px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-2 divide-x divide-gray-200 lg:grid-cols-4">
            {[
              { icon: Wrench, label: '500+ vợt / tháng', sub: 'Kinh nghiệm thực tế' },
              { icon: BadgeCheck, label: 'Máy điện tử', sub: 'Căng đều lực, chuẩn kg' },
              { icon: Clock, label: 'Nhận trong ngày', sub: 'Khi vợt & cước có sẵn' },
              { icon: MessageCircle, label: 'Tư vấn miễn phí', sub: 'Trước và sau khi đan' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 px-5 py-4">
                <stat.icon className="h-5 w-5 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-sm font-black text-gray-950">{stat.label}</p>
                  <p className="text-xs text-gray-500">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1536px] px-4 py-12 md:px-6 lg:px-10">

        {/* Quy trình */}
        <section>
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-blue">Quy trình tại shop</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 md:text-3xl">Đan vợt rõ thông số, dễ kiểm soát</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-500 md:text-right">
              Mỗi cây vợt là một setup riêng — tình trạng khung, loại cước, số kg và lối chơi đều được xem xét kỹ trước khi căng.
            </p>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
            {serviceSteps.map((step, index) => (
              <div
                key={step.title}
                className={`flex gap-4 p-5 ${index < 3 ? 'border-b border-gray-200 sm:border-b lg:border-b-0 lg:border-r' : ''} ${index === 1 ? 'sm:border-r' : ''}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-brand-blue">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-black text-gray-950">{step.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== BOOKING WIZARD ===== */}
        <section ref={bookingRef} className="mt-12 scroll-mt-20">
          {!wizardOpen ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-brand-blue bg-blue-50 py-10 text-center">
              <CalendarDays className="h-10 w-10 text-brand-blue" />
              <div>
                <p className="text-lg font-black text-gray-950">Đặt lịch đan vợt trực tuyến</p>
                <p className="mt-1 text-sm text-gray-500">Chọn gói, chọn cước, chọn số kg — xong trong 2 phút.</p>
              </div>
              <button
                onClick={() => openWizard()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-black text-white shadow transition hover:bg-brand-blue-hover"
              >
                <CalendarDays className="h-4 w-4" />
                Bắt đầu đặt lịch
              </button>
            </div>
          ) : submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-green-200 bg-green-50 px-8 py-12 text-center"
            >
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
              <h3 className="mt-4 text-2xl font-black text-gray-950">Đặt lịch thành công!</h3>
              <p className="mt-3 text-sm text-gray-600">
                Cảm ơn <span className="font-black text-gray-900">{form.name}</span>. Chúng tôi sẽ gọi xác nhận lịch hẹn vào số <span className="font-black text-gray-900">{form.phone}</span> sớm nhất có thể.
              </p>
              <div className="mx-auto mt-6 max-w-sm rounded-lg border border-gray-200 bg-white p-5 text-left text-sm">
                <p className="font-black text-gray-950">Tóm tắt đơn</p>
                <div className="mt-3 space-y-1 text-gray-600">
                  {selectedString && <p>Cước: <span className="font-semibold text-gray-900">{selectedString.name}</span></p>}
                  {form.tension && <p>Số kg: <span className="font-semibold text-gray-900">{form.tension} kg</span></p>}
                  {form.extraServices.length > 0 && (
                    <p>Dịch vụ thêm: <span className="font-semibold text-gray-900">{form.extraServices.map((id) => EXTRA_SERVICES.find((s) => s.id === id)?.label).join(', ')}</span></p>
                  )}
                  <p>Ngày: <span className="font-semibold text-gray-900">{form.date}</span></p>
                  {form.note && <p>Ghi chú: <span className="font-semibold text-gray-900">{form.note}</span></p>}
                </div>
              </div>
              <button
                onClick={() => { setWizardOpen(false); setSubmitted(false); }}
                className="mt-6 cursor-pointer text-xs font-black uppercase text-brand-blue underline-offset-2 hover:underline"
              >
                Đặt thêm lịch khác
              </button>
            </motion.div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* Wizard header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-blue">Đặt lịch đan vợt</p>
                  <button onClick={() => setWizardOpen(false)} className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-gray-700">
                    Đóng ✕
                  </button>
                </div>
                {/* Progress bar */}
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                  {WIZARD_STEPS.map((label, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                      <React.Fragment key={label}>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                            done ? 'bg-green-500 text-white' : active ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {done ? '✓' : i + 1}
                          </span>
                          <span className={`text-xs font-black ${active ? 'text-gray-950' : done ? 'text-green-600' : 'text-gray-400'}`}>
                            {label}
                          </span>
                        </div>
                        {i < WIZARD_STEPS.length - 1 && (
                          <div className={`h-px w-6 shrink-0 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
                {/* Main step content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {/* Step 0: Chọn cước */}
                    {step === 0 && (
                      <motion.div key="step0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                        <h3 className="mb-3 text-base font-black text-gray-950">Chọn loại cước</h3>
                        {/* Search */}
                        <div className="relative mb-4">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            value={stringSearch}
                            onChange={(e) => setStringSearch(e.target.value)}
                            placeholder="Tìm theo tên, hãng..."
                            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                          />
                        </div>
                        {/* 2-col grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {STRINGS
                            .filter((s) =>
                              stringSearch === '' ||
                              s.name.toLowerCase().includes(stringSearch.toLowerCase()) ||
                              s.brand.toLowerCase().includes(stringSearch.toLowerCase())
                            )
                            .slice(0, 6)
                            .map((s) => (
                              <button
                                key={s.id}
                                onClick={() => setForm((f) => ({ ...f, stringId: s.id }))}
                                className={`flex cursor-pointer flex-col rounded-lg border p-4 text-left transition ${
                                  form.stringId === s.id
                                    ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue'
                                    : 'border-gray-200 hover:border-brand-blue hover:bg-blue-50'
                                }`}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="text-sm font-black text-gray-950 leading-snug">{s.name}</p>
                                  <span className="ml-2 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-black text-gray-500">{s.brand}</span>
                                </div>
                                <p className="text-base font-black text-red-600">{UTILS.formatCurrency(s.price)}</p>
                                <p className="mt-1 text-[11px] text-gray-400">{s.diameter} · {s.feel}</p>
                                <div className={`mt-3 rounded-full border py-1.5 text-center text-xs font-black transition ${
                                  form.stringId === s.id
                                    ? 'border-brand-blue bg-brand-blue text-white'
                                    : 'border-brand-blue text-brand-blue hover:bg-blue-50'
                                }`}>
                                  {form.stringId === s.id ? '✓ Đã chọn' : 'Chọn'}
                                </div>
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Nhập số kg */}
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                        <h3 className="mb-1 text-base font-black text-gray-950">Nhập số kg căng</h3>
                        <p className="mb-5 text-xs text-gray-500">Thường từ 9 – 14 kg. Không chắc? Nhân viên sẽ tư vấn khi bạn mang vợt đến.</p>
                        <div className="flex items-center gap-3">
                          <div className="relative w-48">
                            <input
                              type="number"
                              min={9}
                              max={14}
                              step={0.5}
                              value={form.tension}
                              onChange={(e) => setForm((f) => ({ ...f, tension: e.target.value }))}
                              placeholder="Vd: 11"
                              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-xl font-black text-gray-950 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            />
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">kg</span>
                          </div>
                          {form.tension && (
                            <p className="text-sm text-gray-500">
                              ≈ {Math.round(Number(form.tension) * 2.205)} lbs
                            </p>
                          )}
                        </div>
                        <p className="mt-4 text-xs text-gray-400">Khung vợt phong trào thường an toàn 9 – 11 kg. Khung thi đấu có thể lên 12 – 14 kg.</p>
                      </motion.div>
                    )}

                    {/* Step 2: Dịch vụ thêm */}
                    {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                        <h3 className="mb-1 text-base font-black text-gray-950">Dịch vụ thêm</h3>
                        <p className="mb-4 text-xs text-gray-500">Tuỳ chọn — bỏ qua nếu không cần thêm gì.</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Không chọn gì */}
                          <button
                            onClick={() => setForm((f) => ({ ...f, extraServices: [] }))}
                            className={`cursor-pointer rounded-lg border p-4 text-left transition ${
                              form.extraServices.length === 0
                                ? 'border-gray-400 bg-gray-50 ring-2 ring-gray-400'
                                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-black text-gray-950">Không cần thêm</p>
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                form.extraServices.length === 0 ? 'border-gray-400 bg-gray-400' : 'border-gray-300'
                              }`}>
                                {form.extraServices.length === 0 && <span className="text-[10px] font-black text-white">✓</span>}
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Chỉ đan vợt, không kèm dịch vụ phụ.</p>
                            <p className="mt-2 text-sm font-black text-gray-400">—</p>
                          </button>
                          {EXTRA_SERVICES.map((svc) => {
                            const checked = form.extraServices.includes(svc.id);
                            return (
                              <button
                                key={svc.id}
                                onClick={() => setForm((f) => ({
                                  ...f,
                                  extraServices: checked
                                    ? f.extraServices.filter((x) => x !== svc.id)
                                    : [...f.extraServices, svc.id],
                                }))}
                                className={`cursor-pointer rounded-lg border p-4 text-left transition ${
                                  checked
                                    ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue'
                                    : 'border-gray-200 hover:border-brand-blue hover:bg-blue-50'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-black text-gray-950">{svc.label}</p>
                                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                    checked ? 'border-brand-blue bg-brand-blue' : 'border-gray-300'
                                  }`}>
                                    {checked && <span className="text-[10px] font-black text-white">✓</span>}
                                  </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">{svc.desc}</p>
                                <p className={`mt-2 text-sm font-black ${svc.price === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {svc.price === 0 ? 'Miễn phí' : `+${UTILS.formatCurrency(svc.price)}`}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Thông tin */}
                    {step === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                        <h3 className="mb-4 text-base font-black text-gray-950">Thông tin liên hệ</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase text-gray-700">
                              <User className="h-3.5 w-3.5" /> Họ và tên
                            </label>
                            <input
                              value={form.name}
                              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                              placeholder="Nguyễn Văn A"
                              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase text-gray-700">
                              <Phone className="h-3.5 w-3.5" /> Số điện thoại
                            </label>
                            <input
                              value={form.phone}
                              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                              placeholder="0901 234 567"
                              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase text-gray-700">
                              <CalendarDays className="h-3.5 w-3.5" /> Ngày mang vợt đến
                            </label>
                            <input
                              type="date"
                              value={form.date}
                              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase text-gray-700">
                              <MessageCircle className="h-3.5 w-3.5" /> Ghi chú (tuỳ chọn)
                            </label>
                            <input
                              value={form.note}
                              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                              placeholder="Vd: vợt bị lún gen nhẹ..."
                              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Xác nhận */}
                    {step === 4 && (
                      <motion.div key="step4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                        <h3 className="mb-4 text-base font-black text-gray-950">Xác nhận đặt lịch</h3>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm">
                          <div className="space-y-3">
                            {[
                              selectedString ? { label: 'Cước', value: `${selectedString.name} — ${UTILS.formatCurrency(selectedString.price)}` } : null,
                              form.tension ? { label: 'Số kg', value: `${form.tension} kg` } : null,
                              form.extraServices.length > 0 ? {
                                label: 'Dịch vụ thêm',
                                value: form.extraServices.map((id) => EXTRA_SERVICES.find((s) => s.id === id)?.label).join(', '),
                              } : null,
                              { label: 'Họ tên', value: form.name },
                              { label: 'Điện thoại', value: form.phone },
                              { label: 'Ngày đến', value: form.date },
                              form.note ? { label: 'Ghi chú', value: form.note } : null,
                            ].filter(Boolean).map((row) => (
                              <div key={row!.label} className="flex justify-between gap-4">
                                <span className="text-gray-500">{row!.label}</span>
                                <span className="text-right font-semibold text-gray-950">{row!.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
                            {selectedString && (
                              <div className="flex justify-between text-gray-500">
                                <span>Tiền cước</span>
                                <span>{UTILS.formatCurrency(selectedString.price)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-500">
                              <span>Phí đan vợt</span>
                              <span className="italic text-gray-400">Tính tại shop</span>
                            </div>
                            {form.extraServices.length > 0 && (
                              <div className="flex justify-between text-gray-500">
                                <span>Dịch vụ thêm</span>
                                <span>{UTILS.formatCurrency(form.extraServices.reduce((sum, id) => sum + (EXTRA_SERVICES.find((s) => s.id === id)?.price ?? 0), 0))}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-gray-200 pt-2 font-black text-gray-950">
                              <span>Giá sau khi đan hoàn thiện</span>
                              <span className="text-brand-blue">
                                {UTILS.formatCurrency(
                                  (selectedString?.price ?? 0) +
                                  form.extraServices.reduce((sum, id) => sum + (EXTRA_SERVICES.find((s) => s.id === id)?.price ?? 0), 0)
                                )}
                                <span className="ml-1 text-xs font-medium text-gray-400">+ phí đan</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={handleBack}
                      disabled={step === 0}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-700 transition hover:border-gray-300 disabled:cursor-default disabled:opacity-40"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Quay lại
                    </button>
                    {step < 4 ? (
                      <button
                        onClick={handleNext}
                        disabled={!canNext()}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-xs font-black text-white transition hover:bg-brand-blue-hover disabled:cursor-default disabled:opacity-40"
                      >
                        Tiếp theo
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-xs font-black text-white transition hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Xác nhận đặt lịch
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary sidebar */}
                <div className="hidden border-l border-gray-200 bg-gray-50 p-6 lg:block">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">Tóm tắt</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <SummaryRow label="Cước" value={selectedString?.name} placeholder="Chưa chọn" />
                    <SummaryRow label="Số kg" value={form.tension ? `${form.tension} kg` : ''} placeholder="Chưa nhập" />
                    <SummaryRow
                      label="Dịch vụ thêm"
                      value={form.extraServices.length > 0 ? form.extraServices.map((id) => EXTRA_SERVICES.find((s) => s.id === id)?.label).join(', ') : ''}
                      placeholder="Không có"
                    />
                    <SummaryRow label="Tên" value={form.name} placeholder="Chưa điền" />
                    <SummaryRow label="SĐT" value={form.phone} placeholder="Chưa điền" />
                    <SummaryRow label="Ngày" value={form.date} placeholder="Chưa chọn" />
                  </div>
                  {selectedString && (
                    <div className="mt-6 rounded-lg border border-brand-blue/20 bg-blue-50 p-4">
                      <p className="text-xs text-gray-500">Ước tính cước</p>
                      <p className="mt-1 text-xl font-black text-brand-blue">
                        {UTILS.formatCurrency(
                          selectedString.price +
                          form.extraServices.reduce((sum, id) => sum + (EXTRA_SERVICES.find((s) => s.id === id)?.price ?? 0), 0)
                        )}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400">Phí đan vợt tính thêm tại shop.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Sản phẩm gợi ý */}
        <section className="mt-14">
          <div className="mb-9 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-brand-yellow" />
                <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">Cước, phụ kiện và vợt nên xem</h2>
              </div>
              <p className="mt-2 text-sm text-gray-500">Sản phẩm đi kèm dịch vụ đan vợt tại VietBad</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-xs font-black uppercase text-gray-900">
              <Sparkles className="h-4 w-4 text-brand-yellow" />
              Có thể thêm vào giỏ ngay
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stringingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.some((item) => item.id === product.id)}
                onToggleWishlist={() => handleToggleWishlist(product)}
                onQuickView={() => setQuickViewProduct(product)}
                onAddToCart={() => handleAddToCartDirectly(product)}
              />
            ))}
          </div>
        </section>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        vouchersApplied={vouchersApplied}
        onApplyVoucher={(voucher) => {
          if (vouchersApplied.some((item) => item.code === voucher.code)) { showToast('Mã đã được áp dụng'); return; }
          setVouchersApplied((prev) => [...prev, voucher]);
          showToast(`Đã áp dụng mã ${voucher.code}`);
        }}
        onRemoveVoucher={(code) => setVouchersApplied((prev) => prev.filter((item) => item.code !== code))}
        onUpdateQuantity={(id, quantity) => setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity } : item).filter((item) => item.quantity > 0))}
        onRemoveItem={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
        onOrderSuccess={(order: Order) => { showToast(`Đặt hàng thành công: ${order.id}`); setCart([]); }}
        onClearCart={() => setCart([])}
      />

      <ProductDetailModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? wishlist.some((item) => item.id === quickViewProduct.id) : false}
        onToggleWishlist={() => quickViewProduct && handleToggleWishlist(quickViewProduct)}
        onAddToCart={handleAddToCart}
      />

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.94 }}
              className="rounded-lg bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}

function SummaryRow({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0 text-gray-400">{label}</span>
      <span className={`text-right text-xs ${value ? 'font-semibold text-gray-950' : 'italic text-gray-300'}`}>
        {value || placeholder}
      </span>
    </div>
  );
}
