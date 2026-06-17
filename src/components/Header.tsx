/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, Heart, User, Phone, Search, ClipboardList } from 'lucide-react';
import { CartItem, Product } from '../types';

interface HeaderProps {
  cart: CartItem[];
  wishlist: Product[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  cart,
  wishlist,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  searchQuery,
  setSearchQuery
}: HeaderProps) {
  const [showPhoneCopied, setShowPhoneCopied] = useState(false);

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0909999999');
    setShowPhoneCopied(true);
    setTimeout(() => setShowPhoneCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm transition-all duration-300">
      <div className="mx-auto flex max-w-7xl flex-col px-4 md:px-6 lg:px-8">
        
        {/* Main Header Container */}
        <div className="flex h-20 items-center justify-between gap-4 md:gap-8">
          
          {/* Brand Logo */}
          <a href="#" className="flex cursor-pointer items-center text-2xl font-extrabold tracking-tight md:text-3xl" id="header-logo-btn">
            <span className="text-brand-blue font-black tracking-tighter">VIETBAD</span>
            <span className="text-brand-yellow font-black tracking-tighter">STORE</span>
          </a>

          {/* Search Box */}
          <div className="relative hidden max-w-md flex-1 md:block" id="header-search-container">
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
                maxLength={40}
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-400 hover:text-gray-600"
              >
                Xóa
              </button>
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

            {/* Wishlist Link */}
            <button
              id="header-wishlist-toggle-btn"
              onClick={onOpenWishlist}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 focus:outline-none"
              title="Danh sách yêu thích"
            >
              <Heart className={`h-5 w-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

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
                maxLength={40}
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[10px] text-gray-400"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
