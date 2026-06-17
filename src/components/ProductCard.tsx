/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
        return 'from-teal-50 to-cyan-100/30';
      case 'string':
        return 'from-rose-50 to-pink-100/30';
      case 'clothes':
        return 'from-violet-50 to-purple-100/30';
      default:
        return 'from-gray-50 to-slate-100/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg hover:border-brand-blue/25"
      id={`product-card-${product.id}`}
    >
      
      {/* Badge Tags overlay */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-1.5">
        {product.isHot && (
          <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
            HOT
          </span>
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
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={onToggleWishlist}
          id={`wishlist-toggle-${product.id}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-red-500 transition-colors focus:outline-none ${
            isWishlisted ? 'text-red-500 bg-red-50' : 'hover:bg-gray-50'
          }`}
          title="Thêm yêu thích"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        <button
          onClick={onQuickView}
          id={`quick-view-toggle-${product.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-brand-blue hover:bg-gray-50 transition-colors focus:outline-none"
          title="Xem nhanh chi tiết"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Racket/Emoji Image Container with Category Grid Backdrop */}
      <div 
        onClick={onQuickView}
        className={`relative flex h-52 w-full cursor-pointer items-center justify-center bg-gradient-to-b ${getCategoryGradient(
          product.category
        )} p-6 transition-transform duration-500 group-hover:scale-105`}
      >
        <span className="text-7xl select-none filter drop-shadow-md group-hover:rotate-12 transition-transform duration-300">
          {product.imageEmoji}
        </span>
      </div>

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

          <h3 
            onClick={onQuickView}
            className="mt-2 cursor-pointer text-sm font-extrabold leading-snug text-gray-900 group-hover:text-brand-blue transition-colors line-clamp-2 min-h-[40px]"
          >
            {product.name}
          </h3>
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
              className="flex items-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 text-xs font-black text-white hover:bg-brand-blue-hover transition shadow-sm active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{product.category === 'racket' ? 'Chọn căng' : '+ Thêm'}</span>
            </button>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
