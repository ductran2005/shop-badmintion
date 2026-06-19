"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Eye, Flame, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { UTILS } from '../data';

interface PromotionProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

function getStableNumber(productId: string) {
  let hash = 0;

  for (let index = 0; index < productId.length; index += 1) {
    hash = (hash * 31 + productId.charCodeAt(index)) % 9973;
  }

  return hash;
}

export default function PromotionProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart
}: PromotionProductCardProps) {
  const soldCount = product.soldCount && product.soldCount > 0
    ? product.soldCount
    : 42 + (getStableNumber(product.id) % 216);
  const stockLeft = product.stockLeft ?? 5;
  const extraSalePercent = 8 + (getStableNumber(`${product.id}-sale`) % 9);
  const promoPrice = Math.max(
    10000,
    Math.floor((product.price * (100 - extraSalePercent)) / 100 / 1000) * 1000
  );
  const comparePrice = product.price;
  const displayOldPrice = product.oldPrice ?? comparePrice;
  const discountPercent = Math.max(
    extraSalePercent,
    Math.round(((displayOldPrice - promoPrice) / displayOldPrice) * 100)
  );
  const soldProgress = Math.min(100, Math.max(18, Math.round((soldCount / (soldCount + stockLeft)) * 100)));
  const promotionProduct: Product = {
    ...product,
    price: promoPrice,
    oldPrice: displayOldPrice,
    discountPercent
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-950/10"
      id={`promotion-product-card-${product.id}`}
    >
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
        <Flame className="h-3 w-3 fill-white" />
        -{discountPercent}%
      </div>

      <div className="absolute right-3 top-3 z-20 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={onToggleWishlist}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:text-red-500 ${
            isWishlisted ? 'text-red-500' : 'text-gray-600'
          }`}
          title="Thêm yêu thích"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => onQuickView(promotionProduct)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-md transition hover:text-brand-blue"
          title="Xem nhanh"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <Link href={`/product/${product.id}`} className="relative block h-52 overflow-hidden bg-red-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 20vw"
            className="object-cover object-center transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl">{product.imageEmoji}</div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
            {product.brand}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.rating}
          </span>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="mt-2 block min-h-[42px] text-sm font-black leading-snug text-gray-950 line-clamp-2 transition group-hover:text-red-600"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-black text-red-600">{UTILS.formatCurrency(promoPrice)}</span>
          <span className="text-xs text-gray-400 line-through">{UTILS.formatCurrency(displayOldPrice)}</span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">
            Sale thêm {extraSalePercent}%
          </span>
        </div>

        <div className="mt-3 rounded-lg bg-red-50 p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
            <span className="text-red-700">Đã bán {soldCount.toLocaleString('vi-VN')}</span>
            <span className="text-gray-500">Còn {stockLeft}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${soldProgress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="h-full rounded-full bg-red-600"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(promotionProduct)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-xs font-black text-white transition hover:bg-red-700"
        >
          <ShoppingBag className="h-4 w-4" />
          Mua giá sale
        </button>
      </div>
    </motion.article>
  );
}
