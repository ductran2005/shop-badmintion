/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, Phone, Search, ClipboardList, ChevronRight } from 'lucide-react';
import { CartItem, Product } from '../types';
import { CATEGORIES, PRODUCTS, UTILS } from '../data';

interface HeaderProps {
  cart: CartItem[];
  wishlist: Product[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

const categoryMegaTiles: Record<string, { image: string; label: string; description: string }> = {
  racket: {
    image: '/logo/image.png',
    label: 'Vợt cầu lông',
    description: 'Tấn công, cân bằng, trợ lực'
  },
  shoes: {
    image: '/logo/image copy.png',
    label: 'Giày cầu lông',
    description: 'Bám sân, êm chân, chống lật'
  },
  shirt: {
    image: '/logo/image copy 2.png',
    label: 'Áo cầu lông',
    description: 'Thoáng khí, nhẹ, mau khô'
  },
  skirt: {
    image: '/logo/image copy 4.png',
    label: 'Váy cầu lông',
    description: 'Co giãn, năng động, gọn dáng'
  },
  pants: {
    image: '/logo/image copy 3.png',
    label: 'Quần cầu lông',
    description: 'Linh hoạt cho từng pha bật nhảy'
  },
  bag: {
    image: '/logo/image copy 5.png',
    label: 'Túi vợt',
    description: 'Đựng vợt, giày và phụ kiện'
  },
  backpack: {
    image: '/logo/image copy 6.png',
    label: 'Balo cầu lông',
    description: 'Gọn nhẹ cho tập luyện hằng ngày'
  },
  accessories: {
    image: '/logo/image copy 7.png',
    label: 'Phụ kiện',
    description: 'Cước, quấn cán, cầu và combo'
  }
};

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

export default function Header({
  cart,
  onOpenCart,
  onOpenOrders,
  searchQuery,
  setSearchQuery,
  onSelectCategory
}: HeaderProps) {
  const [showPhoneCopied, setShowPhoneCopied] = useState(false);

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const normalizedSearchQuery = normalizeSearchText(searchQuery.trim());
  const searchResults = React.useMemo(() => {
    if (!normalizedSearchQuery) return [];

    return PRODUCTS.filter((product) => {
      const searchableText = normalizeSearchText([
        product.name,
        product.brand,
        product.categoryName,
        product.description
      ].join(' '));

      return searchableText.includes(normalizedSearchQuery);
    }).slice(0, 6);
  }, [normalizedSearchQuery]);
  const showSearchResults = searchQuery.trim().length > 0;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0909999999');
    setShowPhoneCopied(true);
    setTimeout(() => setShowPhoneCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm transition-all duration-300">
      <div className="mx-auto flex max-w-[1536px] flex-col px-4 md:px-6 lg:px-10">
        
        {/* Main Header Container */}
        <div className="flex h-20 items-center justify-between gap-4 md:gap-8">
          
          {/* Brand Logo */}
          <Link href="/" className="flex cursor-pointer items-center text-2xl font-extrabold tracking-tight md:text-3xl" id="header-logo-btn">
            <span className="text-brand-blue font-black tracking-tighter">VIETBAD</span>
            <span className="text-brand-yellow font-black tracking-tighter">STORE</span>
          </Link>

          {/* Search Box */}
          <div className="relative hidden max-w-xl flex-1 md:block" id="header-search-container">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm vợt, giày, phụ kiện cầu lông..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-400 hover:text-gray-600"
              >
                Xóa
              </button>
            )}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-2xl">
                {searchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setSearchQuery('')}
                        className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-3 py-2.5 transition hover:bg-blue-50"
                      >
                        <div className="relative h-14 w-14 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                          <Image
                            src={product.imageUrl ?? '/logo/image.png'}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-black leading-snug text-gray-950">{product.name}</p>
                          <p className="mt-1 text-[11px] font-bold uppercase text-gray-500">{product.brand} · {product.categoryName}</p>
                        </div>
                        <div className="text-right text-xs font-black text-red-600">
                          {UTILS.formatCurrency(product.price)}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm font-black text-gray-950">Chưa tìm thấy sản phẩm</p>
                    <p className="mt-1 text-xs text-gray-500">Thử tìm theo tên vợt, giày, túi hoặc thương hiệu.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions & Contacts */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Phone Contact */}
            <button
              id="hotline-contact-btn"
              onClick={handleCopyPhone}
              className="relative flex cursor-pointer items-center gap-2 rounded-full bg-brand-yellow px-3.5 py-1.5 text-left text-xs font-black text-gray-900 transition-all hover:bg-brand-yellow-hover focus:outline-none"
            >
              <Phone className="h-4 w-4 animate-bounce text-gray-900" />
              <div>
                <span className="block text-[9px] uppercase leading-none opacity-80">Tư vấn mua hàng</span>
                <span className="block text-xs font-extrabold">0909 999 999</span>
              </div>
              {showPhoneCopied && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded bg-gray-950 px-2 py-1 text-[10px] font-medium text-white shadow-md">
                  Đã sao chép!
                </div>
              )}
            </button>

            {/* Simulated Orders List Icon */}
            <button
              id="header-orders-history-btn"
              onClick={onOpenOrders}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 focus:outline-none"
              title="Lịch sử mua hàng"
            >
              <ClipboardList className="h-5 w-5" />
            </button>

            {/* Login Link */}
            <Link
              href="/login"
              id="header-login-btn"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 focus:outline-none"
              title="Đăng nhập"
              aria-label="Đăng nhập"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              id="header-cart-toggle-btn"
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-hover focus:outline-none"
              title="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-black text-gray-900">
                  {totalCartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Search bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="header-search-mobile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm vợt, giày, phụ kiện..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 transition-colors focus:border-brand-blue focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[10px] text-gray-400"
              >
                Xóa
              </button>
            )}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-2xl">
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setSearchQuery('')}
                        className="grid grid-cols-[48px_1fr] items-center gap-3 px-3 py-2.5 transition hover:bg-blue-50"
                      >
                        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                          <Image
                            src={product.imageUrl ?? '/logo/image.png'}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-black leading-snug text-gray-950">{product.name}</p>
                          <p className="mt-1 text-[11px] font-black text-red-600">{UTILS.formatCurrency(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm font-black text-gray-950">Chưa tìm thấy sản phẩm</p>
                    <p className="mt-1 text-xs text-gray-500">Thử tìm theo tên hoặc thương hiệu.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <nav className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1536px] items-center justify-start gap-7 overflow-x-auto px-4 py-3 text-[11px] font-black uppercase tracking-wider text-gray-700 [scrollbar-width:none] md:overflow-visible md:justify-center md:gap-12 md:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden">
          <Link href="/#hero-section" className="shrink-0 transition hover:text-brand-blue">Trang chủ</Link>
          <div className="group relative shrink-0">
            <Link
              href="/#categories-section"
              className="inline-flex items-center gap-1 transition hover:text-brand-blue focus:text-brand-blue focus:outline-none"
              aria-haspopup="true"
            >
              Sản phẩm
              <ChevronRight className="h-3 w-3 rotate-90 transition group-hover:translate-y-0.5" />
            </Link>
            <div className="invisible fixed left-1/2 top-[168px] z-50 w-[min(92vw,940px)] -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 md:absolute md:left-1/2 md:top-full">
              <div className="grid max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white text-left shadow-2xl lg:grid-cols-[260px_1fr]">
                <div className="flex flex-col justify-between bg-brand-blue px-6 py-6 text-white">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-yellow">
                      Vietbad Store
                    </p>
                    <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight">
                      Sản phẩm
                    </h3>
                    <p className="mt-3 text-xs font-semibold leading-5 text-blue-100">
                      Chọn nhanh nhóm sản phẩm cần xem: vợt, giày, quần áo, túi và phụ kiện.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4">
                  {CATEGORIES.filter((cat) => cat.id !== 'all').map((cat) => {
                    const tile = categoryMegaTiles[cat.id];

                    return (
                      <Link
                        href={`/category/${cat.id}`}
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                        }}
                        className="group/card overflow-hidden rounded-md border border-gray-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-lg focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <div className="relative h-24 overflow-hidden bg-blue-50">
                          <Image
                            src={tile?.image ?? '/logo/image.png'}
                            alt={tile?.label ?? cat.name}
                            fill
                            sizes="180px"
                            className="object-cover transition duration-300 group-hover/card:scale-110"
                          />
                        </div>
                        <div className="min-h-20 px-3 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-black uppercase leading-tight text-gray-950">
                              {tile?.label ?? cat.name}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-yellow" />
                          </div>
                          <p className="mt-1 text-[10px] font-semibold normal-case leading-4 tracking-normal text-gray-500">
                            {tile?.description ?? 'Sản phẩm cầu lông chính hãng'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <Link href="/best-sellers" className="shrink-0 transition hover:text-brand-blue">Khuyến mãi cực hot</Link>
          <Link href="/racket-stringing" className="shrink-0 transition hover:text-brand-blue">Dịch vụ đan vợt</Link>
          <Link href="/contact" className="shrink-0 transition hover:text-brand-blue">Liên hệ tư vấn</Link>
        </div>
      </nav>
    </header>
  );
}
