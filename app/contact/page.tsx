"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Home, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartItem, Product, Voucher } from '../types';

const STORES = [
  { name: 'VietBad Store FPT City', phone: '0338 000 308', address: 'Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng' },
];

type ContactForm = { name: string; email: string; phone: string; message: string };
const EMPTY: ContactForm = { name: '', email: '', phone: '', message: '' };

export default function ContactPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  const validate = () => {
    const e: Partial<ContactForm> = {};
    if (form.name.trim().length < 2) e.name = 'Vui lòng nhập họ tên';
    if (!/^[0-9]{9,11}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ';
    if (form.message.trim().length < 5) e.message = 'Vui lòng nhập nội dung';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    console.info('Contact form submitted:', form);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => {}}
        onOpenWishlist={() => {}}
        onOpenOrders={() => {}}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(id) => { window.location.href = `/category/${id}`; }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1536px] items-center gap-2 px-4 py-3 text-xs font-semibold text-gray-500 md:px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-brand-blue">
            <Home className="h-3.5 w-3.5" /> Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-brand-blue">Liên hệ</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1536px] px-4 py-12 md:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">

          {/* LEFT: Form + Map */}
          <div className="space-y-8">
            {/* Intro */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-blue">Liên hệ với chúng tôi</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Nơi giải đáp mọi thắc mắc của bạn</h1>
              <div className="mt-4 flex flex-wrap gap-5">
                <a href="tel:0338000308" className="inline-flex items-center gap-2 text-sm font-black text-brand-blue hover:underline">
                  <Phone className="h-4 w-4" /> 0338 000 308
                </a>
                <a href="mailto:info@shopvnb.com" className="inline-flex items-center gap-2 text-sm font-black text-brand-blue hover:underline">
                  <Mail className="h-4 w-4" /> info@vietbad.com
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-5 text-sm font-black uppercase tracking-wider text-gray-950">Gửi tin nhắn cho chúng tôi</p>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-10 text-center"
                  >
                    <CheckCircle2 className="h-14 w-14 text-green-500" />
                    <p className="text-lg font-black text-gray-950">Đã nhận được tin nhắn!</p>
                    <p className="text-sm text-gray-500">Chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.</p>
                    <button
                      onClick={() => { setForm(EMPTY); setSubmitted(false); }}
                      className="mt-2 cursor-pointer text-xs font-black uppercase text-brand-blue underline-offset-2 hover:underline"
                    >
                      Gửi tin nhắn khác
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Nguyễn Văn A"
                          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-blue/20 ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-brand-blue'}`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase text-gray-700">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="email@example.com"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="0901 234 567"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-blue/20 ${errors.phone ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-brand-blue'}`}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase text-gray-700">Nội dung <span className="text-red-500">*</span></label>
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Bạn cần tư vấn gì? Vd: cước phù hợp, số kg căng, loại vợt..."
                        className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-blue/20 ${errors.message ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-brand-blue'}`}
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-black text-white transition hover:bg-brand-blue-hover"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Gửi thông tin
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <iframe
                title="VietBad Store Map"
                src="https://maps.google.com/maps?q=15.976894684233525,108.26023195948636&z=17&output=embed"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* RIGHT: Store list */}
          <div>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-blue">Hệ thống cửa hàng</p>
                <h2 className="mt-1 text-lg font-black text-gray-950">VietBad Store</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {STORES.map((store, i) => (
                  <li key={store.name} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-brand-blue">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-black text-gray-950">{store.name}</p>
                        <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline">
                          <Phone className="h-3 w-3" /> {store.phone}
                        </a>
                        <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-gray-500">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                          {store.address}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 px-6 py-4">
                <p className="text-xs text-gray-400">Giờ mở cửa: 8:00 – 21:00 tất cả các ngày trong tuần</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
