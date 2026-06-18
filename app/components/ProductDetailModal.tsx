/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShieldCheck, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { AVAILABLE_TENSIONS, UTILS } from '../data';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: (product: Product, quantity: number, tension?: string) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedTensionState, setSelectedTensionState] = useState<{
    productId?: string;
    value?: string;
  }>({});
  const productImages = React.useMemo(
    () => product
      ? ([product.imageUrl, ...(product.galleryImages ?? [])].filter(Boolean) as string[])
      : [],
    [product]
  );
  const [activeImageState, setActiveImageState] = useState<{
    productId?: string;
    value?: string;
  }>({});

  if (!product) return null;

  const selectedTension = selectedTensionState.productId === product.id
    ? selectedTensionState.value
    : (product.category === 'racket' ? AVAILABLE_TENSIONS[2] : undefined);
  const activeImage = activeImageState.productId === product.id
    ? activeImageState.value
    : productImages[0];

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedTension);
    onClose();
    // Reset local inputs
    setQuantity(1);
  };

  const getTensionAddonPriceText = (tension?: string) => {
    if (!tension || tension.includes('Không căng')) return '';
    return ' (+ Đã bao gồm công đan)';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white text-gray-900 shadow-2xl z-10"
            id={`product-detail-modal-${product.id}`}
          >
            
            {/* Close Button */}
            <button
              onClick={onClose}
              id="close-detail-modal-btn"
              className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors z-20 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Body: Split 2 columns md:grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
              
              {/* Column 1: Main Graphics */}
              <div className="flex flex-col items-center">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-gray-50 border border-gray-100">
                  {activeImage ? (
                    <Image
                      src={activeImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-contain p-5"
                    />
                  ) : (
                    <span className="text-9xl select-none filter drop-shadow-xl animate-pulse">
                      {product.imageEmoji}
                    </span>
                  )}
                  
                  {/* Category Pill Tag */}
                  <span className="absolute bottom-4 left-4 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-black text-brand-blue">
                    {product.categoryName}
                  </span>
                </div>

                {productImages.length > 1 && (
                  <div className="mt-3 grid w-full grid-cols-4 gap-2">
                    {productImages.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImageState({ productId: product.id, value: image })}
                        className={`relative aspect-square overflow-hidden rounded-xl border bg-white transition ${
                          activeImage === image
                            ? 'border-brand-blue ring-2 ring-blue-100'
                            : 'border-gray-200 hover:border-brand-blue/60'
                        }`}
                        aria-label={`Xem ảnh sản phẩm ${index + 1}`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} - góc ${index + 1}`}
                          fill
                          sizes="72px"
                          className="object-contain p-1.5"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Return/Authentic Badges list */}
                <div className="mt-5 w-full rounded-2xl bg-gray-50 p-4 border border-gray-150 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Đổi mới hoàn tiền 100% khi phát hiện hàng giả</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Hỗ trợ bảo hành chính hãng 3 tháng rạn nứt</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Specifics details & configuration */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Brand and Stars */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-brand-blue">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviewsCount} đánh giá)</span>
                    </div>
                  </div>

                  <h1 className="mt-2 text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
                    {product.name}
                  </h1>

                  {/* Price Row */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-red-600">
                      {UTILS.formatCurrency(product.price)}
                    </span>
                    {product.oldPrice && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          {UTILS.formatCurrency(product.oldPrice)}
                        </span>
                        <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-black text-red-600">
                          -{product.discountPercent}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description text */}
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Dynamic Custom Configuration Options (Stringing tension if racket!) */}
                  {product.category === 'racket' && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <label className="block text-xs font-black uppercase tracking-wide text-gray-700 mb-2">
                        🧵 Chọn thông số độ căng (Tension):
                      </label>
                      <select
                        id={`tension-selector-${product.id}`}
                        value={selectedTension}
                        onChange={(e) => setSelectedTensionState({ productId: product.id, value: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-gray-800 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      >
                        {AVAILABLE_TENSIONS.map((tension) => (
                          <option key={tension} value={tension}>
                            {tension}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-gray-500">
                        * Miễn phí căng cước Yonex/Victor mặc định đi kèm khung{getTensionAddonPriceText(selectedTension)}.
                      </p>
                    </div>
                  )}

                  {/* Technical Specifications Table */}
                  {product.specs && (
                    <div className="mt-5 border-t border-gray-100 pt-4 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2.5">
                        ⚙️ Thông số kỹ thuật chi tiết:
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {product.specs.weight && (
                          <div className="flex flex-col border-b border-gray-50 pb-1">
                            <span className="text-gray-400">Trọng lượng (U):</span>
                            <span className="font-bold text-gray-800">{product.specs.weight}</span>
                          </div>
                        )}
                        {product.specs.balance && (
                          <div className="flex flex-col border-b border-gray-50 pb-1">
                            <span className="text-gray-400">Điểm cân bằng:</span>
                            <span className="font-bold text-gray-800">{product.specs.balance}</span>
                          </div>
                        )}
                        {product.specs.tension && (
                          <div className="flex flex-col border-b border-gray-50 pb-1">
                            <span className="text-gray-400">Sức căng tối đa:</span>
                            <span className="font-bold text-gray-800">{product.specs.tension}</span>
                          </div>
                        )}
                        {product.specs.stiffness && (
                          <div className="flex flex-col border-b border-gray-50 pb-1">
                            <span className="text-gray-400">Độ cứng thân vợt:</span>
                            <span className="font-bold text-gray-800">{product.specs.stiffness}</span>
                          </div>
                        )}
                        {product.specs.material && (
                          <div className="flex flex-col col-span-2 border-b border-gray-50 pb-1">
                            <span className="text-gray-400">Vật liệu thi công:</span>
                            <span className="font-bold text-gray-800">{product.specs.material}</span>
                          </div>
                        )}
                        {product.specs.origin && (
                          <div className="flex flex-col col-span-2 border-b border-gray-50 pb-1">
                            <span className="text-gray-400">Nguồn gốc sản xuất:</span>
                            <span className="font-bold text-gray-800">{product.specs.origin}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Quantity selection & Interactive checkout buttons */}
                <div className="mt-6 border-t border-gray-150 pt-4 flex items-center gap-4 flex-wrap">
                  
                  {/* Quantity Spinner */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      id="details-minus-qty-btn"
                      className="px-3.5 py-2 hover:bg-gray-100 font-bold border-r border-gray-200 cursor-pointer text-sm text-gray-600 focus:outline-none"
                    >
                      -
                    </button>
                    <span className="px-5 py-2 font-bold text-sm min-w-[40px] text-center select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      id="details-plus-qty-btn"
                      className="px-3.5 py-2 hover:bg-gray-100 font-bold border-l border-gray-200 cursor-pointer text-sm text-gray-600 focus:outline-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Add Wishlist Toggle inside modal */}
                  <button
                    onClick={onToggleWishlist}
                    id={`modal-wishlist-btn-${product.id}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-gray-600 transition-colors focus:outline-none ${
                      isWishlisted 
                        ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  </button>

                  {/* Commitment Buy Trigger */}
                  <button
                    onClick={handleAddToCart}
                    id={`modal-add-to-cart-submit-${product.id}`}
                    className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 font-extrabold text-sm text-white hover:bg-brand-blue-hover transition shadow-md active:scale-95"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Thêm vào giỏ hàng - {UTILS.formatCurrency(product.price * quantity)}</span>
                  </button>
                </div>

              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
