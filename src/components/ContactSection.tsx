/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { ConsultationRequest } from '../types';

interface ContactSectionProps {
  onAddConsultation: (request: ConsultationRequest) => void;
}

export default function ContactSection({ onAddConsultation }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    // Create consultation request
    const request: ConsultationRequest = {
      id: 'CR-' + Math.floor(10000 + Math.random() * 90000),
      customerName: formData.name,
      customerPhone: formData.phone,
      message: formData.message || 'Cần tư vấn một số vợt cầu lông thích hợp cho người mới gia nhập',
      createdAt: new Date().toISOString()
    };

    onAddConsultation(request);
    setIsSuccess(true);
    setFormData({ name: '', phone: '', message: '' });

    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
  };

  return (
    <div className="bg-slate-900 py-16 text-white" id="contact-section">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Brand Info and Coordinates */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                VIETBAD <span className="text-brand-yellow">STORE</span>
              </h2>
              <div className="mt-2 h-1 w-16 rounded bg-brand-yellow" />
              <p className="mt-4 text-sm text-gray-300 leading-relaxed max-w-md">
                Cửa hàng cầu lông uy tín hàng đầu Đà Nẵng, chuyên cung cấp trang thiết bị tập luyện chính hãng. Chăm sóc kỹ thuật đan vợt theo quy chuẩn hiệp hội cầu lông Châu Á.
              </p>
            </div>

            {/* Structured details Info cards list */}
            <div className="mt-8 space-y-4 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-800 p-2 text-brand-yellow shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Đại bản doanh tại Đà Nẵng</h4>
                  <p>123 Đường Hải Phòng, Quận Hải Châu, TP. Đà Nẵng</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-800 p-2 text-brand-yellow shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Điện thoại Hotline tư vấn</h4>
                  <p>0909 999 999 (Hỗ trợ Zalo/Facebook liên tục 24/7)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-800 p-2 text-brand-yellow shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Hòm thư điện tử Support</h4>
                  <p>support@vietbadstore.vn | cskh@vietbad.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form for requests submissions */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-800 border border-slate-700 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-brand-yellow" />
              <h3 className="text-lg font-black tracking-wide uppercase text-white">GỬI THÔNG TIN TƯ VẤN NHANH</h3>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-6 bg-slate-750 border border-emerald-500/20 rounded-2xl text-center space-y-3"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <h4 className="text-base font-extrabold text-white">XỬ LÝ THÔNG TIN THÀNH CÔNG</h4>
                <p className="text-xs text-gray-300 max-w-sm">
                  Cảm ơn bạn! VietBad đã tiếp nhận yêu cầu. Kỹ thuật viên đan vợt sẽ chủ động kết nối Zalo với bạn trong vài phút nhé!
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                      Họ và tên của bạn <span className="text-brand-yellow">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-3 text-xs text-white focus:border-brand-yellow focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                      Số điện thoại liện lạc (Zalo) <span className="text-brand-yellow">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912 xxx xxx"
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-3 text-xs text-white focus:border-brand-yellow focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                    Cây vợt / sản phẩm hoặc thắc mắc cần tư vấn chính xác
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ví dụ: Em chơi cầu phong trào cổ tay hơi yếu, nhờ shop tư vấn cây Voltric / Astrox hoặc Lining chất chơi nào giá từ 1 triệu đến 2 triệu đồng nhé..."
                    rows={4}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-3 text-xs text-white focus:border-brand-yellow focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-consultation-btn"
                    className="w-full rounded-xl bg-brand-yellow py-3.5 text-xs font-black text-slate-950 uppercase tracking-widest hover:bg-brand-yellow-hover transition focus:outline-none cursor-pointer"
                  >
                    GỬI NGAY ĐỂ LẤY ƯU ĐÃI ĐAN VỢT
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
