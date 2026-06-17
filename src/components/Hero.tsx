/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Zap, ShieldCheck, Ticket } from 'lucide-react';
import { VOUCHERS } from '../data';
import { Voucher } from '../types';

interface HeroProps {
  onApplyVoucher: (voucher: Voucher) => void;
}

export default function Hero({ onApplyVoucher }: HeroProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (voucher: Voucher) => {
    navigator.clipboard.writeText(voucher.code);
    onApplyVoucher(voucher);
    setCopiedCode(voucher.code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-sky-100 py-12 md:py-20 lg:py-24" id="hero-section">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
          
          {/* Left Column Text & Vouchers */}
          <div className="md:col-span-7 flex flex-col justify-center">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
                <Zap className="h-3.5 w-3.5 text-blue-700 fill-blue-700" />
                SẢN PHẨM CHÍNH HÃNG 100%
              </span>
              
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                CẦU LÔNG <br/>
                <span className="text-brand-yellow font-black italic drop-shadow-sm">VƯỢT TRỘI</span>
              </h1>
              
              <p className="mt-4 max-w-xl text-base text-blue-100 md:text-lg">
                VietBad Store chuyên cung cấp Vợt, Giày, Phụ kiện cầu lông chính hãng từ Yonex, Victor, Lining. Căng vợt tiêu chuẩn lấy ngay trong ngày.
              </p>
            </motion.div>

            {/* Clickable Vouchers Row */}
            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-wider text-white opacity-95 mb-3">
                🔥 Click nhận ngay voucher áp dụng vào giỏ hàng:
              </p>
              <div className="flex flex-wrap gap-3">
                {VOUCHERS.map((voucher, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={voucher.code}
                    id={`hero-voucher-${voucher.code}`}
                    onClick={() => handleCopyCode(voucher)}
                    className="flex cursor-pointer flex-col items-start border-2 border-dashed border-white/50 bg-white/10 p-3 text-left text-white transition hover:bg-white/20 rounded-xl"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-black tracking-wider uppercase text-brand-yellow">
                      <Ticket className="h-3 w-3" />
                      {voucher.code}
                    </div>
                    <div className="mt-1 text-xs font-bold">
                      {voucher.discountType === 'percentage' 
                        ? `Giảm ${voucher.discountValue}%` 
                        : `Giảm ${(voucher.discountValue / 1000)}K`}
                    </div>
                    <div className="text-[10px] text-blue-100 opacity-90 line-clamp-1 max-w-[140px]">
                      ĐT: {voucher.minOrderValue >= 1000000 ? '1Tr' : '499K+'}
                    </div>
                  </motion.button>
                ))}
              </div>
              {copiedCode && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 text-xs font-bold text-brand-yellow"
                >
                  🎉 Đã áp dụng mã {copiedCode} vào giỏ hàng của bạn!
                </motion.p>
              )}
            </div>

            {/* Gifts & Offers Container */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
              <div className="flex items-start gap-3.5 rounded-2xl bg-white/95 p-4 text-gray-900 border border-blue-100 shadow-sm">
                <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-blue uppercase tracking-wide">QUÀ TẶNG KÈM</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Tặng cuốn cán + bao đựng vợt cao cấp cho mọi hóa đơn mua vợt từ 199.000đ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-white/95 p-4 text-gray-900 border border-blue-100 shadow-sm">
                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-blue uppercase tracking-wide">ĐAN VỢT MIỄN PHÍ</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Căng trợ lực chuẩn chỉnh bằng máy điện tử bởi kỹ thuật viên kinh nghiệm 5 năm.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Large Aesthetic Spotlight */}
          <div className="md:col-span-5 relative mt-4 md:mt-0 flex items-center justify-center">
            <div className="relative flex aspect-square w-72 items-center justify-center sm:w-80 md:w-96">
              
              {/* Spinning / Pulsing ambient circle details */}
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-30" />
              <div className="absolute inset-4 rounded-full bg-white/30 backdrop-blur-sm" />
              <div className="absolute inset-10 rounded-full bg-brand-yellow/35" />
              
              {/* Product Image */}
              <motion.img
                initial={{ opacity: 0, rotate: -25, scale: 0.8 }}
                animate={{ opacity: 1, rotate: -6, scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 60 }}
                src="https://images.unsplash.com/photo-1613936086827-62a73afdbf16?auto=format&fit=crop&w=700&q=80"
                alt="Badminton Racket"
                referrerPolicy="no-referrer"
                className="relative z-10 w-4/5 object-contain drop-shadow-2xl filter"
                style={{ transformOrigin: 'center center' }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
