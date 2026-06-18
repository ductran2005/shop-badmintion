/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart, Eye, Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { UTILS } from '../data';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onQuickView: () => void;
  onAddToCart: () => void;
}

const cardEntry = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart
}: ProductCardProps) {
  
  // Custom theme backdrop gradients depending on category for premium visuals
  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'racket':
        return 'from-blue-50 to-indigo-100/50';
      case 'shoes':
        return 'from-amber-50 to-orange-100/30';
      case 'bag':
      case 'backpack':
        return 'from-teal-50 to-cyan-100/30';
      case 'accessories':
        return 'from-rose-50 to-pink-100/30';
      case 'shirt':
      case 'skirt':
      case 'pants':
        return 'from-violet-50 to-purple-100/30';
      default:
        return 'from-gray-50 to-slate-100/50';
    }
  };

  return (
    <motion.div
      variants={cardEntry}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 130, damping: 18, mass: 0.8 }}
      whileHover={{ y: -10, scale: 1.015 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-colors duration-300 hover:border-brand-blue/30 hover:shadow-2xl hover:shadow-blue-950/10"
      id={`product-card-${product.id}`}
    >
      <div className="pointer-events-none absolute inset-0 z-20 -translate-x-[140%] bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.34)_45%,transparent_70%)] transition-transform duration-1000 ease-out group-hover:translate-x-[140%]" />
      <div className="pointer-events-none absolute inset-x-8 -bottom-10 z-0 h-20 rounded-full bg-brand-blue/0 blur-2xl transition-colors duration-500 group-hover:bg-brand-blue/20" />
      
      {/* Badge Tags overlay */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-1.5">
        {product.isHot && (
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.8 }}
            className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
          >
            HOT
          </motion.span>
        )}
        {product.isNew && (
          <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
            NEW
          </span>
        )}
        {product.isSale && product.discountPercent && (
          <span className="rounded-full bg-brand-yellow px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      {/* Hover Action Overlay bar */}
      <div className="absolute right-4 top-4 z-30 flex translate-x-0 flex-col gap-2 opacity-100 transition-all duration-300 sm:translate-x-4 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
        <motion.button
          onClick={onToggleWishlist}
          whileHover={{ scale: 1.12, rotate: isWishlisted ? 0 : -8 }}
          whileTap={{ scale: 0.9 }}
          id={`wishlist-toggle-${product.id}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-red-500 transition-colors focus:outline-none ${
            isWishlisted ? 'text-red-500 bg-red-50' : 'hover:bg-gray-50'
          }`}
          title="Thêm yêu thích"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </motion.button>

        <motion.button
          onClick={onQuickView}
          whileHover={{ scale: 1.12, rotate: 8 }}
          whileTap={{ scale: 0.9 }}
          id={`quick-view-toggle-${product.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-brand-blue hover:bg-gray-50 transition-colors focus:outline-none"
          title="Xem nhanh chi tiết"
        >
          <Eye className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Product image */}
      <Link
        href={`/product/${product.id}`}
        aria-label={`Xem chi tiết ${product.name}`}
        className={`relative flex h-52 w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-b ${getCategoryGradient(
          product.category
        )}`}
      >
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.42),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition duration-700 ease-out group-hover:scale-105 group-hover:saturate-125"
          />
        ) : (
          <span className="select-none text-7xl drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
            {product.imageEmoji}
          </span>
        )}
      </Link>

      {/* Body Content */}
      <div className="flex flex-col justify-between flex-1 p-5">
        
        {/* Brand & Stars */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{product.rating}</span>
              <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
            </div>
          </div>

          <Link
            href={`/product/${product.id}`}
            className="mt-2 block min-h-[40px] cursor-pointer text-sm font-extrabold leading-snug text-gray-900 transition-colors line-clamp-2 group-hover:text-brand-blue"
          >
            {product.name}
          </Link>

          {/* Size */}
          {(product.size ?? product.specs?.weight) && (
            <p className="mt-1.5 text-xs text-gray-500">
              Size: <span className="font-semibold text-gray-700">{product.size ?? product.specs?.weight?.split(' ')[0]}</span>
            </p>
          )}
        </div>

        {/* Pricing & Add Cart Area */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between flex-wrap gap-1">
            <div className="flex flex-col">
              {product.oldPrice && (
                <span className="text-[11px] text-gray-400 line-through">
                  {UTILS.formatCurrency(product.oldPrice)}
                </span>
              )}
              <span className="text-base font-black text-red-600">
                {UTILS.formatCurrency(product.price)}
              </span>
            </div>

            <button
              onClick={onAddToCart}
              id={`add-to-cart-btn-${product.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-blue-hover hover:shadow-lg hover:shadow-brand-blue/25 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-12" />
              <span>{product.category === 'racket' ? 'Chọn căng' : '+ Thêm'}</span>
            </button>
          </div>

          {/* Sold / Stock */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-[11px] text-gray-400">
            <span>Đã bán: <span className="font-semibold text-gray-600">{product.soldCount ?? 0}</span></span>
            <span>Còn lại: <span className="font-semibold text-gray-600">{product.stockLeft ?? 5}</span></span>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
