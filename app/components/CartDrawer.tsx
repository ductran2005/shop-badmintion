/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Trash2,
  X
} from 'lucide-react';
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

const createOrderId = () => 'VB-' + Math.floor(100000 + Math.random() * 900000);

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

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    paymentMethod: 'cod' as 'cod' | 'banking'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  vouchersApplied.forEach((voucher) => {
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
    const found = VOUCHERS.find((v) => v.code === codeUpper);

    if (!found) {
      setPromoError('Mã giảm giá không tồn tại');
      return;
    }
    if (subtotal < found.minOrderValue) {
      setPromoError(`Mã này áp dụng cho đơn từ ${UTILS.formatCurrency(found.minOrderValue)}`);
      return;
    }
    if (vouchersApplied.some((v) => v.code === found.code)) {
      setPromoError('Mã này đã được áp dụng');
      return;
    }

    onApplyVoucher(found);
    setPromoInput('');
    setPromoError('');
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

    const newOrder: Order = {
      id: createOrderId(),
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

    onOrderSuccess(newOrder);
    setPlacedOrder(newOrder);
    setCheckoutStep('success');
    onClearCart();
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
    setPromoError('');
    onClose();
  };

  const titleByStep = {
    cart: 'Giỏ hàng của bạn',
    form: 'Thông tin đặt hàng',
    success: 'Đặt hàng thành công'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetDrawerFlow}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          />

          <div className="absolute inset-y-0 right-0 flex max-w-full pl-0 sm:pl-8">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="flex h-full w-screen max-w-[460px] flex-col bg-white text-gray-950 shadow-2xl"
              id="shopping-cart-drawer"
            >
              <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-brand-blue">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black uppercase tracking-tight text-gray-950">
                        {titleByStep[checkoutStep]}
                      </h2>
                      {checkoutStep !== 'success' && (
                        <p className="mt-0.5 text-xs font-semibold text-gray-500">
                          {cart.length > 0 ? `${totalItems} sản phẩm trong đơn` : 'Sẵn sàng cho đơn hàng mới'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={resetDrawerFlow}
                    id="close-cart-btn"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 focus:outline-none"
                    aria-label="Đóng giỏ hàng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {checkoutStep === 'cart' && (
                <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 sm:px-5">
                  {cart.length === 0 ? (
                    <div className="flex min-h-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                      <p className="mt-5 text-base font-black text-gray-950">Giỏ hàng đang trống</p>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                        Chọn vợt, giày hoặc phụ kiện yêu thích rồi quay lại đây để thanh toán.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-6 cursor-pointer rounded-md bg-brand-blue px-5 py-3 text-xs font-black uppercase text-white transition hover:bg-brand-blue-hover focus:outline-none"
                      >
                        Tiếp tục mua sắm
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <article
                            key={item.id}
                            className="grid grid-cols-[84px_1fr] gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                            id={`cart-item-row-${item.id}`}
                          >
                            <div className="relative h-[84px] w-[84px] overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                              {item.product.imageUrl ? (
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  fill
                                  sizes="84px"
                                  className="object-contain p-1.5"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-3xl">
                                  {item.product.imageEmoji}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-sm font-black leading-snug text-gray-950">
                                    {item.product.name}
                                  </p>
                                  <p className="mt-1 text-[11px] font-black uppercase text-brand-blue">
                                    {item.product.brand}
                                  </p>
                                </div>
                                <button
                                  onClick={() => onRemoveItem(item.id)}
                                  id={`cart-remove-item-${item.id}`}
                                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none"
                                  title="Xóa khỏi giỏ"
                                  aria-label="Xóa sản phẩm khỏi giỏ"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              {item.selectedTension && (
                                <div className="mt-2 inline-flex max-w-full items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                  <PackageCheck className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
                                  <span className="truncate">{item.selectedTension}</span>
                                </div>
                              )}

                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex h-9 items-center overflow-hidden rounded-md border border-gray-200 bg-white">
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    id={`cart-minus-qty-${item.id}`}
                                    className="flex h-full w-9 cursor-pointer items-center justify-center text-gray-500 transition hover:bg-gray-100 focus:outline-none"
                                    aria-label="Giảm số lượng"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="min-w-9 px-2 text-center text-sm font-black">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    id={`cart-plus-qty-${item.id}`}
                                    className="flex h-full w-9 cursor-pointer items-center justify-center text-gray-500 transition hover:bg-gray-100 focus:outline-none"
                                    aria-label="Tăng số lượng"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <div className="text-right">
                                  <p className="text-sm font-black text-red-600">
                                    {UTILS.formatCurrency(item.product.price * item.quantity)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="mt-0.5 text-[10px] font-semibold text-gray-400">
                                      {UTILS.formatCurrency(item.product.price)} / sản phẩm
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>

                      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-pink-500" />
                            <p className="text-xs font-black uppercase tracking-wide text-gray-700">
                              Mã khuyến mãi
                            </p>
                          </div>
                          {discountAmount > 0 && (
                            <span className="text-xs font-black text-red-600">
                              -{UTILS.formatCurrency(discountAmount)}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            maxLength={40}
                            placeholder="Nhập mã, ví dụ: VIETBAD50"
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value);
                              setPromoError('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleApplyVoucherCode(promoInput);
                            }}
                            className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <button
                            onClick={() => handleApplyVoucherCode(promoInput)}
                            id="apply-vouch-btn"
                            className="shrink-0 cursor-pointer rounded-md bg-brand-blue px-4 py-2.5 text-sm font-black text-white transition hover:bg-brand-blue-hover focus:outline-none"
                          >
                            Áp dụng
                          </button>
                        </div>
                        {promoError && (
                          <p className="mt-2 text-xs font-bold text-red-600">{promoError}</p>
                        )}

                        {vouchersApplied.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {vouchersApplied.map((voucher) => (
                              <div
                                key={voucher.code}
                                className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-2.5 py-1.5 text-xs font-black text-gray-800"
                              >
                                <Ticket className="h-3.5 w-3.5 text-brand-blue" />
                                <span>
                                  {voucher.code} giảm {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `${voucher.discountValue / 1000}K`}
                                </span>
                                <button
                                  onClick={() => onRemoveVoucher(voucher.code)}
                                  id={`remove-vouch-${voucher.code}`}
                                  className="cursor-pointer text-gray-400 transition hover:text-red-600 focus:outline-none"
                                  title="Gỡ mã khuyến mãi"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  )}
                </div>
              )}

              {checkoutStep === 'form' && (
                <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 sm:px-5">
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-blue" />
                        <h3 className="text-sm font-black uppercase text-gray-950">Thông tin nhận hàng</h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase text-gray-600">
                            Họ và tên <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-xs font-bold text-red-600">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase text-gray-600">
                            Số điện thoại <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="0905 xxx xxx"
                            className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          {formErrors.phone && (
                            <p className="mt-1 text-xs font-bold text-red-600">{formErrors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase text-gray-600">
                            Email xác nhận
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
                            className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase text-gray-600">
                            Địa chỉ giao hàng <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                            rows={3}
                            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          {formErrors.address && (
                            <p className="mt-1 text-xs font-bold text-red-600">{formErrors.address}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase text-gray-600">
                            Ghi chú đơn hàng
                          </label>
                          <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="Ví dụ: giao sau 18h, lưu ý khi đan cước..."
                            rows={2}
                            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-brand-blue" />
                        <h3 className="text-sm font-black uppercase text-gray-950">Phương thức thanh toán</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label
                          className={`cursor-pointer rounded-md border p-3 transition ${
                            formData.paymentMethod === 'cod'
                              ? 'border-brand-blue bg-blue-50 text-brand-blue'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={formData.paymentMethod === 'cod'}
                            onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                            className="sr-only"
                          />
                          <span className="block text-sm font-black">COD</span>
                          <span className="mt-1 block text-xs font-semibold">Thanh toán khi nhận hàng</span>
                        </label>

                        <label
                          className={`cursor-pointer rounded-md border p-3 transition ${
                            formData.paymentMethod === 'banking'
                              ? 'border-brand-blue bg-blue-50 text-brand-blue'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={formData.paymentMethod === 'banking'}
                            onChange={() => setFormData({ ...formData, paymentMethod: 'banking' })}
                            className="sr-only"
                          />
                          <span className="block text-sm font-black">Chuyển khoản</span>
                          <span className="mt-1 block text-xs font-semibold">Xác nhận nhanh hơn</span>
                        </label>
                      </div>
                      {formData.paymentMethod === 'banking' && (
                        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs leading-5 text-gray-700">
                          <p className="font-black text-gray-950">Thông tin chuyển khoản</p>
                          <p className="mt-1">Nội dung: <strong className="text-brand-blue">VBS {formData.phone || 'SĐT'}</strong></p>
                          <p>Vietcombank - STK: 1234 5678 99</p>
                        </div>
                      )}
                    </section>

                    <div className="grid grid-cols-3 gap-3 pb-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="col-span-1 cursor-pointer rounded-md border border-gray-200 bg-white py-3 text-xs font-black uppercase text-gray-600 transition hover:bg-gray-50 focus:outline-none"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        id="submit-order-form"
                        className="col-span-2 cursor-pointer rounded-md bg-brand-yellow py-3 text-xs font-black uppercase text-gray-950 shadow-sm transition hover:bg-brand-yellow-hover focus:outline-none"
                      >
                        Đặt hàng ngay
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {checkoutStep === 'success' && placedOrder && (
                <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-gray-50 px-4 py-8 text-center sm:px-5">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600"
                  >
                    <CheckCircle2 className="h-12 w-12" />
                  </motion.div>

                  <h3 className="mt-5 text-2xl font-black text-gray-950">Cảm ơn quý khách!</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                    Đơn hàng đã được lưu thành công. VietBad Store sẽ liên hệ xác nhận trong thời gian sớm nhất.
                  </p>

                  <div className="mt-6 w-full rounded-lg border border-gray-200 bg-white p-4 text-left text-sm shadow-sm">
                    <div className="flex justify-between gap-3 border-b border-gray-100 py-2 first:pt-0">
                      <span className="text-gray-500">Mã đơn hàng</span>
                      <strong className="text-brand-blue">{placedOrder.id}</strong>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-gray-100 py-2">
                      <span className="text-gray-500">Người nhận</span>
                      <strong className="text-right">{placedOrder.customerName}</strong>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-gray-100 py-2">
                      <span className="text-gray-500">Số điện thoại</span>
                      <strong>{placedOrder.customerPhone}</strong>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 pt-3">
                      <span className="font-black text-gray-950">Tổng thanh toán</span>
                      <strong className="text-xl font-black text-red-600">{UTILS.formatCurrency(placedOrder.total)}</strong>
                    </div>
                  </div>

                  <button
                    onClick={resetDrawerFlow}
                    className="mt-6 w-full cursor-pointer rounded-md bg-brand-blue px-6 py-3.5 text-sm font-black uppercase text-white transition hover:bg-brand-blue-hover focus:outline-none"
                  >
                    Tiếp tục mua hàng
                  </button>
                </div>
              )}

              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] sm:px-5">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3 text-gray-600">
                      <span>Tạm tính</span>
                      <span className="font-black text-gray-950">{UTILS.formatCurrency(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between gap-3 text-red-600">
                        <span>Giảm giá</span>
                        <span className="font-black">-{UTILS.formatCurrency(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between gap-3 text-gray-600">
                      <span>Vận chuyển</span>
                      <span className="font-black text-gray-950">
                        {shippingFee === 0 ? 'Miễn phí' : UTILS.formatCurrency(shippingFee)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-gray-200 pt-3">
                      <span className="text-base font-black text-gray-950">Tổng thanh toán</span>
                      <span className="text-2xl font-black text-red-600">{UTILS.formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  {checkoutStep === 'cart' && (
                    <button
                      onClick={() => setCheckoutStep('form')}
                      id="proceed-checkout-btn"
                      className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-yellow py-3.5 text-sm font-black uppercase text-gray-950 shadow-sm transition hover:bg-brand-yellow-hover focus:outline-none"
                    >
                      <span>Tiếp tục thanh toán</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                    <span>Thanh toán bảo mật 100% VietBad Encrypted</span>
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
