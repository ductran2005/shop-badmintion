/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
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
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-colors duration-300 hover:border-brand-blue/30 hover:shadow-2xl hover:shadow-blue-950/10 sm:rounded-3xl"
      id={`product-card-${product.id}`}
    >
      <div className="pointer-events-none absolute inset-0 z-20 -translate-x-[140%] bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.34)_45%,transparent_70%)] transition-transform duration-1000 ease-out group-hover:translate-x-[140%]" />
      <div className="pointer-events-none absolute inset-x-8 -bottom-10 z-0 h-20 rounded-full bg-brand-blue/0 blur-2xl transition-colors duration-500 group-hover:bg-brand-blue/20" />

      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 sm:left-4 sm:top-4 sm:gap-1.5">
        {product.isHot && (
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.8 }}
            className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:px-2.5 sm:text-[10px] sm:tracking-wider"
          >
            HOT
          </motion.span>
        )}
        {product.isNew && (
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:px-2.5 sm:text-[10px] sm:tracking-wider">
            NEW
          </span>
        )}
        {product.isSale && product.discountPercent && (
          <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-gray-900 shadow-sm sm:px-2.5 sm:text-[10px] sm:tracking-wider">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      <div className="absolute right-2 top-2 z-30 flex translate-x-0 flex-col gap-1.5 opacity-100 transition-all duration-300 sm:right-4 sm:top-4 sm:gap-2 sm:translate-x-4 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
        <motion.button
          onClick={onToggleWishlist}
          whileHover={{ scale: 1.12, rotate: isWishlisted ? 0 : -8 }}
          whileTap={{ scale: 0.9 }}
          id={`wishlist-toggle-${product.id}`}
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition-colors hover:text-red-500 focus:outline-none sm:h-9 sm:w-9 ${
            isWishlisted ? 'text-red-500 bg-red-50' : 'hover:bg-gray-50'
          }`}
          title="Thêm yêu thích"
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </motion.button>

        <motion.button
          onClick={onQuickView}
          whileHover={{ scale: 1.12, rotate: 8 }}
          whileTap={{ scale: 0.9 }}
          id={`quick-view-toggle-${product.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition-colors hover:bg-gray-50 hover:text-brand-blue focus:outline-none sm:h-9 sm:w-9"
          title="Xem nhanh chi tiết"
        >
          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </motion.button>
      </div>

      <Link
        href={`/product/${product.id}`}
        aria-label={`Xem chi tiết ${product.name}`}
        className={`relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-b sm:h-52 ${getCategoryGradient(
          product.category
        )}`}
      >
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.42),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain object-center p-3 transition duration-700 ease-out group-hover:scale-105 group-hover:saturate-125 sm:p-4"
          />
        ) : (
          <span className="select-none text-7xl drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
            {product.imageEmoji}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-5">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="truncate text-[9px] font-black uppercase tracking-wide text-brand-blue sm:text-[10px] sm:tracking-widest">
              {product.brand}
            </span>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[11px] font-bold text-gray-700 sm:text-xs">{product.rating}</span>
              <span className="hidden text-[10px] text-gray-400 sm:inline">({product.reviewsCount})</span>
            </div>
          </div>

          <Link
            href={`/product/${product.id}`}
            className="mt-1.5 block min-h-[34px] cursor-pointer text-[12px] font-extrabold leading-snug text-gray-900 transition-colors line-clamp-2 group-hover:text-brand-blue sm:mt-2 sm:min-h-[40px] sm:text-sm"
          >
            {product.name}
          </Link>

          {(product.size ?? product.specs?.weight) && (
            <p className="mt-1 text-[11px] text-gray-500 sm:mt-1.5 sm:text-xs">
              Size: <span className="font-semibold text-gray-700">{product.size ?? product.specs?.weight?.split(' ')[0]}</span>
            </p>
          )}
        </div>

        <div className="mt-2 border-t border-gray-100 pt-2 sm:mt-4 sm:pt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col">
              {product.oldPrice && (
                <span className="text-[11px] text-gray-400 line-through">
                  {UTILS.formatCurrency(product.oldPrice)}
                </span>
              )}
              <span className="truncate text-[15px] font-black text-red-600 sm:text-base">
                {UTILS.formatCurrency(product.price)}
              </span>
            </div>

            <button
              onClick={onAddToCart}
              id={`add-to-cart-btn-${product.id}`}
              className="flex min-h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-blue px-2 py-1.5 text-[11px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-blue-hover hover:shadow-lg hover:shadow-brand-blue/25 active:scale-95 sm:min-h-9 sm:w-auto sm:rounded-xl sm:px-3.5 sm:py-2 sm:text-xs"
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:-rotate-12" />
              <span>{product.category === 'racket' ? 'Chọn căng' : '+ Thêm'}</span>
            </button>
          </div>

          <div className="mt-3 hidden items-center justify-between border-t border-gray-100 pt-2.5 text-[11px] text-gray-400 sm:flex">
            <span>Đã bán: <span className="font-semibold text-gray-600">{product.soldCount ?? 0}</span></span>
            <span>Còn lại: <span className="font-semibold text-gray-600">{product.stockLeft ?? 5}</span></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
