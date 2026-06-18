/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ClipboardList } from 'lucide-react';
import { Order, ConsultationRequest } from '../types';
import { UTILS } from '../data';

interface OrderHistoryModalProps {
  orders: Order[];
  consultations: ConsultationRequest[];
  isOpen: boolean;
  onClose: () => void;
  onClearOrder: (id: string) => void;
}

export default function OrderHistoryModal({
  orders,
  consultations,
  isOpen,
  onClose,
  onClearOrder
}: OrderHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'consultations'>('orders');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal layout panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative flex flex-col w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl z-10"
            id="order-history-modal"
          >
            
            {/* Header Title */}
            <div className="p-6 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-brand-blue" />
                <h2 className="text-base font-extrabold text-gray-900 uppercase">
                  LỊCH SỬ HOẠT ĐỘNG KHÁCH HÀNG
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition focus:outline-none cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-xs font-black text-center uppercase tracking-wider transition ${
                  activeTab === 'orders' 
                    ? 'border-b-4 border-brand-blue text-brand-blue bg-white' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📦 Đơn hàng ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`flex-1 py-3 text-xs font-black text-center uppercase tracking-wider transition ${
                  activeTab === 'consultations' 
                    ? 'border-b-4 border-brand-blue text-brand-blue bg-white' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                💬 Tư vấn đã gửi ({consultations.length})
              </button>
            </div>

            {/* Scrollable list items container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {activeTab === 'orders' && (
                orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">📦</span>
                    <p className="text-sm text-gray-500 font-bold">Chưa có đơn hàng nào được ghi nhận</p>
                    <p className="text-xs text-gray-400 mt-1">Đơn hàng bạn đặt bằng form thanh toán sẽ hiển thị ở đây.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-gray-150 p-4 bg-gray-50 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 flex-wrap gap-2">
                          <span className="text-xs text-gray-500">
                            Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <span className="text-xs font-extrabold text-brand-blue">
                            Mã ĐH: {order.id}
                          </span>
                        </div>

                        {/* Order Items description List */}
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="text-xs text-gray-700 flex justify-between">
                              <span className="line-clamp-1 max-w-[280px]">
                                {item.product.imageEmoji} {item.product.name} {item.selectedTension ? `(🧵 ${item.selectedTension})` : ''}
                              </span>
                              <span className="font-bold shrink-0">
                                x{item.quantity} - {UTILS.formatCurrency(item.product.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Totals Summary checkout */}
                        <div className="border-t border-gray-200/60 pt-2 flex items-baseline justify-between">
                          <div className="flex gap-2">
                            <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[9px] font-bold">
                              Chờ xác nhận
                            </span>
                            <span className="inline-block rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[9px] font-bold">
                              {order.paymentMethod === 'cod' ? 'Thanh toán COD' : 'Nhận Chuyển khoản'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 mr-1.5">Phải trả:</span>
                            <strong className="text-red-650 text-sm font-black">
                              {UTILS.formatCurrency(order.total)}
                            </strong>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => onClearOrder(order.id)}
                            className="text-[10px] uppercase font-black tracking-wider text-red-500/80 hover:text-red-600 transition cursor-pointer"
                          >
                            Hủy đơn hàng
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'consultations' && (
                consultations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">💬</span>
                    <p className="text-sm text-gray-500 font-bold">Chưa gửi thắc mắc liên hệ nào</p>
                    <p className="text-xs text-gray-400 mt-1">Gửi thông tin ở footer sẽ lưu lịch sử tư vấn tại đây.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((con) => (
                      <div key={con.id} className="rounded-2xl border border-gray-150 p-4 bg-gray-50 space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-105 pb-1">
                          <span className="text-[10px] text-gray-500">
                            ID: {con.id} - {new Date(con.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="inline-block rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-[9px] font-black uppercase">
                            Đã tiếp nhận
                          </span>
                        </div>
                        <p className="text-xs text-gray-800">
                          Người gửi: <strong className="text-gray-950">{con.customerName} ({con.customerPhone})</strong>
                        </p>
                        <p className="text-xs text-gray-600 italic bg-white p-2.5 rounded-xl border border-gray-100">
                          Nội dung: &quot;{con.message}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
