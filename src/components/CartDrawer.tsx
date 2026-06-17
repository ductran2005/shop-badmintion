/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Ticket, CheckCircle2 } from 'lucide-react';
import { CartItem, Voucher, Order } from '../types';
import { UTILS, VOUCHERS } from '../data';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  vouchersApplied: Voucher[];
  onApplyVoucher: (voucher: Voucher) => void;
  onRemoveVoucher: (code: string) => void;
  onUpdateQuantity: (id: string, q: number) => void;
  onRemoveItem: (id: string) => void;
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  vouchersApplied,
  onApplyVoucher,
  onRemoveVoucher,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  onClearCart
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form' | 'success'>('cart');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Checkout Form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    paymentMethod: 'cod' as 'cod' | 'banking'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Calculate voucher discounts
  let discountAmount = 0;
  vouchersApplied.forEach(voucher => {
    if (subtotal >= voucher.minOrderValue) {
      if (voucher.discountType === 'fixed') {
        discountAmount += voucher.discountValue;
      } else {
        discountAmount += Math.round((subtotal * voucher.discountValue) / 100);
      }
    }
  });

  const isFreeshipMet = subtotal >= 499000;
  const shippingFee = isFreeshipMet ? 0 : 30000;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyVoucherCode = (code: string) => {
    const codeUpper = code.trim().toUpperCase();
    const found = VOUCHERS.find(v => v.code === codeUpper);
    if (!found) {
      setPromoError('Mã giảm giá không tồn tại');
      return;
    }
    if (subtotal < found.minOrderValue) {
      setPromoError(`Mã này chỉ áp dụng cho đơn hàng từ ${UTILS.formatCurrency(found.minOrderValue)}`);
      return;
    }
    if (vouchersApplied.some(v => v.code === found.code)) {
      setPromoError('Mã này đã dược áp dụng');
      return;
    }
    onApplyVoucher(found);
    setPromoInput('');
    setPromoError('');
  };

  const handleRemoveVoucherCode = (code: string) => {
    onRemoveVoucher(code);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Vui lòng điền họ tên';
    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng cung cấp số điện thoại';
    } else if (!/^[0-9+ ]{8,12}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.address.trim()) errors.address = 'Vui lòng ghi địa chỉ nhận hàng';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Create Simulated Order
    const newOrder: Order = {
      id: 'VB-' + Math.floor(100000 + Math.random() * 900000),
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      shippingAddress: formData.address,
      shippingNote: formData.note,
      paymentMethod: formData.paymentMethod,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      shippingFee,
      total: grandTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save order
    onOrderSuccess(newOrder);
    setPlacedOrder(newOrder);
    setCheckoutStep('success');
    onClearCart();
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      note: '',
      paymentMethod: 'cod'
    });
  };

  const resetDrawerFlow = () => {
    setCheckoutStep('cart');
    setPlacedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          
          {/* Backdrop wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetDrawerFlow}
            className="absolute inset-0 bg-gray-905 bg-gray-900/60 backdrop-blur-xs"
          />

          {/* Drawer Sliding body */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white text-gray-900 flex flex-col justify-between shadow-2xl h-full"
              id="shopping-cart-drawer"
            >
              
              {/* Header section of Drawer */}
              <div className="p-6 border-b border-gray-150 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-brand-blue" />
                  <h2 className="text-lg font-black text-gray-900 uppercase">
                    {checkoutStep === 'cart' && 'Giỏ hàng của bạn'}
                    {checkoutStep === 'form' && 'Thông tin đặt hàng'}
                    {checkoutStep === 'success' && 'Đặt hàng thành công'}
                  </h2>
                </div>
                <button
                  onClick={resetDrawerFlow}
                  id="close-cart-btn"
                  className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition focus:outline-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* STAGE 1: Standard Cart Items List */}
              {checkoutStep === 'cart' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <span className="text-6xl mb-4 select-none">🛒</span>
                      <p className="text-gray-500 font-bold mb-2">Giỏ hàng của bạn đang trống</p>
                      <button
                        onClick={onClose}
                        className="text-xs font-black text-brand-blue underline uppercase tracking-wide cursor-pointer focus:outline-none"
                      >
                        Quay lại mua sắm ngay
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Cart items loops */}
                      <div className="divide-y divide-gray-100">
                        {cart.map((item) => (
                          <div key={item.id} className="py-4 flex gap-4 first:pt-0" id={`cart-item-row-${item.id}`}>
                            {/* Icon graphic */}
                            <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl select-none shrink-0">
                              {item.product.imageEmoji}
                            </div>
                            
                            {/* Product names / spec options */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-extrabold text-gray-900 leading-snug line-clamp-1">
                                  {item.product.name}
                                </h4>
                                <span className="text-[10px] font-bold text-brand-blue uppercase">
                                  {item.product.brand}
                                </span>
                                {item.selectedTension && (
                                  <p className="text-[10px] text-gray-500 bg-blue-50 py-0.5 px-2 rounded mt-1 line-clamp-1 inline-block">
                                    🧵 {item.selectedTension}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2.5">
                                {/* Quantity buttons */}
                                <div className="flex items-center border border-gray-205 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    id={`cart-minus-qty-${item.id}`}
                                    className="px-2.5 py-0.5 hover:bg-gray-100 text-xs font-bold text-gray-500 focus:outline-none"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    id={`cart-plus-qty-${item.id}`}
                                    className="px-2.5 py-0.5 hover:bg-gray-100 text-xs font-bold text-gray-500 focus:outline-none"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-black text-red-600">
                                    {UTILS.formatCurrency(item.product.price * item.quantity)}
                                  </span>
                                  <button
                                    onClick={() => onRemoveItem(item.id)}
                                    id={`cart-remove-item-${item.id}`}
                                    className="text-gray-400 hover:text-red-500 transition focus:outline-none cursor-pointer"
                                    title="Xóa khỏi giỏ"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Promo voucher input */}
                      <div className="border-t border-gray-100 pt-5">
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                          🎟️ Mã khuyến mãi / Voucher:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={40}
                            placeholder="Nhập mã (Ví dụ: VIETBAD50)"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-blue focus:outline-none"
                          />
                          <button
                            onClick={() => handleApplyVoucherCode(promoInput)}
                            id="apply-vouch-btn"
                            className="rounded-xl bg-brand-blue px-4 py-2 text-xs font-black text-white hover:bg-brand-blue-hover transition cursor-pointer"
                          >
                            Áp dụng
                          </button>
                        </div>
                        {promoError && (
                          <p className="mt-1 text-[11px] text-red-650 font-semibold">{promoError}</p>
                        )}

                        {/* Currently Applied vouchers badges list */}
                        {vouchersApplied.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {vouchersApplied.map((voucher) => (
                              <div
                                key={voucher.code}
                                className="flex items-center gap-1.5 rounded-lg bg-orange-50 border border-brand-yellow/30 px-2 py-1 text-xs font-semibold text-brand-blue"
                              >
                                <Ticket className="h-3 w-3 text-orange-500 shrink-0" />
                                <span>{voucher.code} (Giảm {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `${voucher.discountValue/1000}K`})</span>
                                <button
                                  onClick={() => handleRemoveVoucherCode(voucher.code)}
                                  id={`remove-vouch-${voucher.code}`}
                                  className="text-gray-400 hover:text-red-500 text-[10px] font-black ml-1 cursor-pointer focus:outline-none"
                                  title="Gỡ khuyến học"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STAGE 2: Checkout Form details */}
              {checkoutStep === 'form' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Họ và tên người nhận <span className="text-red-550">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                      {formErrors.name && (
                        <p className="text-[10px] text-red-500 mt-1 font-bold">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Số điện thoại liên lạc <span className="text-red-550">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0905 xxx xxx"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                      {formErrors.phone && (
                        <p className="text-[10px] text-red-500 mt-1 font-bold">{formErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Email nhận xác nhận (Tùy chọn)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Địa chỉ giao hàng hỏa tốc <span className="text-red-550">*</span>
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Số nhà, Tên đường, Quận/Huyện, Đà Nẵng..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none"
                      />
                      {formErrors.address && (
                        <p className="text-[10px] text-red-500 mt-1 font-bold">{formErrors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Yêu cầu đan cước / Ghi chú khác
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Ví dụ: Vừa lòng thắt thêm lớp đệm quấn cán..."
                        rows={2}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-black uppercase text-gray-700 mb-2">
                        💳 Phương thức thanh toán:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition ${
                            formData.paymentMethod === 'cod'
                              ? 'border-brand-blue bg-blue-50 text-brand-blue font-bold'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={formData.paymentMethod === 'cod'}
                            onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                            className="sr-only"
                          />
                          <span className="text-xs">Nhận hàng thanh toán (COD)</span>
                        </label>

                        <label
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition ${
                            formData.paymentMethod === 'banking'
                              ? 'border-brand-blue bg-blue-50 text-brand-blue font-bold'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={formData.paymentMethod === 'banking'}
                            onChange={() => setFormData({ ...formData, paymentMethod: 'banking' })}
                            className="sr-only"
                          />
                          <span className="text-xs">Chuyển khoản (Ưu đãi)</span>
                        </label>
                      </div>
                      {formData.paymentMethod === 'banking' && (
                        <div className="mt-2.5 rounded-xl bg-orange-50 border border-brand-yellow/20 p-2.5 text-[11px] text-gray-700">
                          <p className="font-bold text-orange-800">Thông tin chuyển khoản nhanh:</p>
                          <p className="mt-1">Nội dung CK: <strong className="text-brand-blue">VBS {formData.phone || 'SĐT'}</strong></p>
                          <p>Ngân hàng Vietcombank - STK: 1234 5678 99</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="w-1/3 rounded-xl border border-gray-250 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 uppercase focus:outline-none transition"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        id="submit-order-form"
                        className="flex-1 rounded-xl bg-brand-yellow py-3 text-xs font-black text-gray-900 hover:bg-brand-yellow-hover uppercase shadow transition focus:outline-none text-center cursor-pointer"
                      >
                        Nhấn Đặt Hàng Ngay
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STAGE 3: Order successfully Placed visual screen */}
              {checkoutStep === 'success' && placedOrder && (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="rounded-full bg-green-50 p-4 text-green-600 mb-4"
                  >
                    <CheckCircle2 className="h-16 w-16" />
                  </motion.div>
                  
                  <h3 className="text-xl font-black text-gray-900">
                    CẢM ƠN QUÝ KHÁCH!
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Đơn hàng của quý khách đã được lưu trữ thành công trên hệ thống.
                  </p>

                  <div className="mt-6 w-full rounded-2xl bg-gray-50 border border-gray-150 p-4 text-left text-xs text-gray-700 space-y-2">
                    <p> Mã đơn hàng: <strong className="text-brand-blue text-sm">{placedOrder.id}</strong></p>
                    <p> Người nhận: <strong>{placedOrder.customerName}</strong></p>
                    <p> Số điện thoại: <strong>{placedOrder.customerPhone}</strong></p>
                    <p> Tổng thanh toán: <strong className="text-red-650 text-sm font-black">{UTILS.formatCurrency(placedOrder.total)}</strong></p>
                    <p> Trạng thái đơn hàng: <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[10px] font-bold">Chờ xác nhận</span></p>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-6 leading-relaxed max-w-xs">
                    * Nhân viên tư vấn VietBad Store sẽ chủ động liên hệ tới số điện thoại <strong>{placedOrder.customerPhone}</strong> trong vòng 15-30 phút để chốt lịch đan cước và kích thước giao hàng hỏa tốc.
                  </p>

                  <button
                    onClick={resetDrawerFlow}
                    className="mt-8 cursor-pointer rounded-xl bg-brand-blue px-6 py-3 text-xs font-black text-white hover:bg-brand-blue-hover transition w-full"
                  >
                    Tiếp tục mua hàng
                  </button>
                </div>
              )}

              {/* FOOTER summary computations (only shown for Cart Items and Checkout Form phases!) */}
              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Tạm tính (Subtotal):</span>
                      <span className="font-extrabold text-gray-950">
                        {UTILS.formatCurrency(subtotal)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-orange-650">
                        <span>Chiết khấu mã giảm:</span>
                        <span className="font-extrabold">
                          -{UTILS.formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span>Phí vận chuyển (Freeship ≥ 499K):</span>
                      <span className="font-extrabold text-gray-950">
                        {shippingFee === 0 ? 'Miễn phí' : UTILS.formatCurrency(shippingFee)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-baseline">
                      <span className="font-black text-sm text-gray-900">Tổng thanh toán:</span>
                      <span className="text-xl font-black text-red-600">
                        {UTILS.formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {checkoutStep === 'cart' && (
                    <button
                      onClick={() => setCheckoutStep('form')}
                      id="proceed-checkout-btn"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-yellow py-3.5 text-xs font-black text-gray-900 hover:bg-brand-yellow-hover transition uppercase tracking-wide cursor-pointer focus:outline-none"
                    >
                      <span>Tiếp tục thanh toán</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                    <span>Thanh toán bảo mật an toàn 100% VietBad Encrypted</span>
                  </div>
                </div>
              )}

            </motion.div>
          </div>

        </div>
      )}
    </AnimatePresence>
  );
}
