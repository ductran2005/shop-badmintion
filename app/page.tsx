/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, Wrench, MessageCircle, Zap } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import OrderHistoryModal from './components/OrderHistoryModal';
import Footer from './components/Footer';
import { PRODUCTS, UTILS } from './data';
import { Product, CartItem, Voucher, Order, ConsultationRequest } from './types';

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

export default function Home() {
  // --- Persistent State hooks with LocalStorage Fallbacks ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [vouchersApplied, setVouchersApplied] = useState<Voucher[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const hasLoadedStorage = React.useRef(false);

  // --- Filtering & Search States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // --- Panels Toggles / Modal triggers ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const bestSellerRailRef = React.useRef<HTMLDivElement>(null);

  // --- Aesthetic Custom Toasts State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // --- Ticking Countdown Clock ---
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 14,
    seconds: 36
  });

  useEffect(() => {
    // Load from localStorage after the page is visible, so banners render on first paint.
    const loadStoredState = window.setTimeout(() => {
      try {
        const storedCart = localStorage.getItem('vietbad_cart');
        if (storedCart) setCart(JSON.parse(storedCart));

        const storedWishlist = localStorage.getItem('vietbad_wishlist');
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

        const storedVouchers = localStorage.getItem('vietbad_vouchers');
        if (storedVouchers) setVouchersApplied(JSON.parse(storedVouchers));

        const storedOrders = localStorage.getItem('vietbad_orders');
        if (storedOrders) setOrders(JSON.parse(storedOrders));

        const storedConsults = localStorage.getItem('vietbad_consults');
        if (storedConsults) setConsultations(JSON.parse(storedConsults));
      } catch (e) {
        console.error(e);
      } finally {
        hasLoadedStorage.current = true;
      }
    }, 0);

    return () => window.clearTimeout(loadStoredState);
  }, []);

  // Persistent state synchronization
  useEffect(() => {
    if (hasLoadedStorage.current) {
      localStorage.setItem('vietbad_cart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    if (hasLoadedStorage.current) {
      localStorage.setItem('vietbad_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  useEffect(() => {
    if (hasLoadedStorage.current) {
      localStorage.setItem('vietbad_vouchers', JSON.stringify(vouchersApplied));
    }
  }, [vouchersApplied]);

  useEffect(() => {
    if (hasLoadedStorage.current) {
      localStorage.setItem('vietbad_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (hasLoadedStorage.current) {
      localStorage.setItem('vietbad_consults', JSON.stringify(consultations));
    }
  }, [consultations]);

  // Countdown timer clock ticking simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset timer back to 3 hours relative loop for high fidelity simulation
          return { hours: 3, minutes: 45, seconds: 12 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show customized floating toast alerts
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    // Auto erase toast after 3 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- Handlers: Wishlists ---
  const handleToggleWishlist = (product: Product) => {
    const isAlready = wishlist.some((item) => item.id === product.id);
    if (isAlready) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Đã xóa "${product.name}" khỏi danh sách yêu thích`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Đã thêm "${product.name}" vào danh sách yêu thích!`, 'success');
    }
  };

  // --- Handlers: Voucher applying ---
  const handleApplyVoucher = (voucher: Voucher) => {
    if (vouchersApplied.some((v) => v.code === voucher.code)) {
      showToast(`Mã mấu chốt "${voucher.code}" đã được kích hoạt trước đó rồi`, 'info');
      return;
    }
    setVouchersApplied((prev) => [...prev, voucher]);
    showToast(`Đã áp dụng mã giảm tiền "${voucher.code}" thành công!`, 'success');
  };

  const handleRemoveVoucher = (code: string) => {
    setVouchersApplied((prev) => prev.filter((v) => v.code !== code));
    showToast(`Đã xóa mã voucher "${code}"`, 'info');
  };

  // --- Handlers: Operations on Shopping Cart ---
  const handleAddToCartDirectly = (product: Product) => {
    if (product.category === 'racket') {
      // For rackets, force them to open details modal to select desired tension level
      setQuickViewProduct(product);
      showToast(`Vui lòng chọn thông số mực căng cước cho cây vợt: ${product.brand}`, 'info');
    } else {
      handleAddToCart(product, 1);
    }
  };

  const handleAddToCart = (product: Product, quantity: number, tension?: string) => {
    // Unique key: product representation + specific tension setting representation
    const cartItemId = tension ? `${product.id}-${tension}` : product.id;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { id: cartItemId, product, quantity, selectedTension: tension }];
      }
    });

    const specText = tension ? `(${tension})` : '';
    showToast(`Đã thêm x${quantity} "${product.name}" ${specText} vào giỏ hàng thành công!`, 'success');
  };

  const handleUpdateCartQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    const item = cart.find((i) => i.id === id);
    setCart((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showToast(`Đã xóa "${item.product.name}" khỏi đơn hàng`, 'info');
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // --- Handlers: Order placement & Consultations submissions logs ---
  const handleOrderSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    // Close cart drawer automatic when placing success representation
    showToast(`Đặt hàng thành công! Mã hóa đơn của bạn: ${order.id}`, 'success');
  };

  const handleClearOrderHistory = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Đã hủy bỏ bản ghi đơn hàng ${orderId}`, 'info');
  };

  const scrollBestSellers = (direction: 'left' | 'right') => {
    bestSellerRailRef.current?.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth'
    });
  };

  const allHotProducts = PRODUCTS
    .filter((p) => p.isHot && p.isSale)
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    .slice(0, 5);
  const shouldShowBestSellerArrows = false;
  const normalizedSearchQuery = normalizeSearchText(searchQuery.trim());
  const searchedProducts = React.useMemo(() => {
    if (!normalizedSearchQuery) return [];

    return PRODUCTS.filter((product) => {
      const searchableText = normalizeSearchText([
        product.name,
        product.brand,
        product.categoryName,
        product.description,
        product.specs?.weight,
        product.specs?.balance,
        product.specs?.tension,
        product.specs?.stiffness,
        product.specs?.material,
        product.specs?.origin
      ].filter(Boolean).join(' '));

      return searchableText.includes(normalizedSearchQuery);
    });
  }, [normalizedSearchQuery]);
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-brand-blue selection:text-white" id="main-app-container">
      
      {/* 1. Top bar Banner advertisement */}
      <div className="bg-brand-blue py-2.5 text-center px-4" id="alert-banner-top">
        <p className="text-xs font-black tracking-wider text-white uppercase flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand-yellow animate-ping" />
          🔥 FREESHIP ĐƠN TỪ 499K - ĐAN VỢT lấy ngay trong ngày - Căng chuẩn bằng máy điện tử Châu Á!
        </p>
      </div>

      {/* 2. Responsive Sticky Header Navigation and quick indicators */}
      <Header
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          showToast('Danh sách yêu thích của bạn đang được lưu trong biểu tượng trái tim', 'info');
        }}
        onOpenOrders={() => setIsHistoryOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(categoryId) => {
          setSelectedCategory(categoryId);
          document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. Hero Visual Graphics Spotlight & instant Coupons voucher clicking */}
      <Hero onApplyVoucher={handleApplyVoucher} />

      {/* 4. Main Product Grid Section */}
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 py-14 md:px-6 lg:px-10" id="products-catalog-section">

        <div className="mb-9 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-brand-yellow" />
              <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
                {isSearching ? 'Kết quả tìm kiếm' : 'Sản phẩm bán chạy'}
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {isSearching
                ? `${searchedProducts.length} sản phẩm phù hợp với "${searchQuery.trim()}"`
                : 'Những sản phẩm được mua nhiều nhất tại VietBad Store'}
            </p>
          </div>
          {!isSearching && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollBestSellers('left')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-blue shadow-sm transition hover:border-brand-blue hover:bg-blue-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollBestSellers('right')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-blue shadow-sm transition hover:border-brand-blue hover:bg-blue-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {isSearching ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {searchedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.some((item) => item.id === product.id)}
                  onToggleWishlist={() => handleToggleWishlist(product)}
                  onQuickView={() => setQuickViewProduct(product)}
                  onAddToCart={() => handleAddToCartDirectly(product)}
                />
              ))}
            </div>
            {searchedProducts.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white px-6 py-14 text-center">
                <p className="text-lg font-black text-gray-950">Chưa tìm thấy sản phẩm phù hợp</p>
                <p className="mt-2 text-sm text-gray-500">Thử tìm theo tên sản phẩm, thương hiệu hoặc danh mục như vợt, giày, túi, áo.</p>
              </div>
            )}
          </>
        ) : (
          <div
            ref={bestSellerRailRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-hidden scroll-smooth pb-3"
          >
            {allHotProducts.map((product) => (
              <div key={product.id} className="w-[calc(25%-18px)] shrink-0 snap-start">
                <ProductCard
                  product={product}
                  isWishlisted={wishlist.some((item) => item.id === product.id)}
                  onToggleWishlist={() => handleToggleWishlist(product)}
                  onQuickView={() => setQuickViewProduct(product)}
                  onAddToCart={() => handleAddToCartDirectly(product)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. Category selective filter links */}
      <div className="bg-white py-12 border-b border-gray-105" id="categories-section">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
          }}
          products={PRODUCTS}
        />
      </div>

      {/* 6. Flash Sale Weekend section featuring real-time state countdown clock */}
      <section className="overflow-hidden bg-slate-950 py-14 text-white" id="flash-sale-banner-section">
        <div className="mx-auto max-w-[1536px] px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            {/* Flash text column */}
            <div className="space-y-5 text-center lg:col-span-4 lg:text-left">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                <Zap className="h-3 w-3 fill-white" />
                FLASH SALE CUỐI TUẦN
              </span>
              <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
                Giờ vàng <br /> giá sốc
              </h2>
              <p className="mx-auto max-w-md text-sm leading-6 text-slate-300 lg:mx-0">
                Chọn nhanh các mẫu đang giảm mạnh trong tuần. Số lượng có hạn, giá tự động trở về niêm yết khi hết thời gian sale.
              </p>

              {/* Countdown panel clocks ticker */}
              <div className="flex justify-center gap-3 pt-2 lg:justify-start">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-xl font-black text-brand-blue shadow-md sm:h-16 sm:w-16 sm:text-2xl">
                    {String(countdown.hours).padStart(2, '0')}
                  </div>
                  <span className="mt-1 text-[10px] font-bold uppercase text-slate-300">Giờ</span>
                </div>
                <div className="mt-4 text-xl font-black text-brand-yellow sm:text-2xl">:</div>
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-xl font-black text-brand-blue shadow-md sm:h-16 sm:w-16 sm:text-2xl">
                    {String(countdown.minutes).padStart(2, '0')}
                  </div>
                  <span className="mt-1 text-[10px] font-bold uppercase text-slate-300">Phút</span>
                </div>
                <div className="mt-4 text-xl font-black text-brand-yellow sm:text-2xl">:</div>
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-xl font-black text-brand-blue shadow-md sm:h-16 sm:w-16 sm:text-2xl">
                    {String(countdown.seconds).padStart(2, '0')}
                  </div>
                  <span className="mt-1 text-[10px] font-bold uppercase text-slate-300">Giây</span>
                </div>
              </div>
            </div>

            {/* Flash products list grid display */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-8">
              
              {/* Product 1: Rồng lửa */}
              <div className="relative grid overflow-hidden rounded-lg border border-white/10 bg-white text-gray-900 shadow-2xl md:grid-cols-[42%_1fr]">
                <span className="absolute left-4 top-4 z-10 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                  -30% Giảm
                </span>
                <div className="relative min-h-56 bg-slate-100">
                  <img
                    src={PRODUCTS.find((p) => p.id === 'p5')?.imageUrl ?? '/products/p5.jpg'}
                    alt="Lining Axforce Cannon 4U"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-between p-5">
                  <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue">Lining</span>
                    <h3 className="mt-1 text-base font-black leading-snug text-gray-950">Lining Axforce Cannon 4U</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-black text-red-600">{UTILS.formatCurrency(1490000)}</span>
                      <span className="text-xs text-gray-400 line-through">{UTILS.formatCurrency(1990000)}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">
                      Vợt dễ chơi, trợ lực tốt cho người mới nâng cấp và đánh phong trào.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCartDirectly(PRODUCTS.find((p) => p.id === 'p5') || PRODUCTS[4])}
                    className="mt-5 w-full cursor-pointer rounded-md bg-brand-blue py-2.5 text-xs font-black text-white transition hover:bg-brand-blue-hover"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>

              {/* Product 2: Áo Dry fit */}
              <div className="relative grid overflow-hidden rounded-lg border border-white/10 bg-white text-gray-900 shadow-2xl md:grid-cols-[42%_1fr]">
                <span className="absolute left-4 top-4 z-10 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                  -25% Hot
                </span>
                <div className="relative min-h-56 bg-slate-100">
                  <img
                    src={PRODUCTS.find((p) => p.id === 'p6')?.imageUrl ?? '/products/p6.jpg'}
                    alt="Áo thi đấu Yonex Dry Fit"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-between p-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue">Áo thể thao</span>
                    <h3 className="mt-1 text-base font-black leading-snug text-gray-950">Áo thi đấu Yonex Dry Fit</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-black text-red-600">{UTILS.formatCurrency(299000)}</span>
                      <span className="text-xs text-gray-400 line-through">{UTILS.formatCurrency(399000)}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">
                      Chất vải nhẹ, thoáng khí, phù hợp tập luyện và thi đấu cuối tuần.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCartDirectly(PRODUCTS.find((p) => p.id === 'p6') || PRODUCTS[5])}
                    className="mt-5 w-full cursor-pointer rounded-md bg-brand-blue py-2.5 text-xs font-black text-white transition hover:bg-brand-blue-hover"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. Facilities / Promises / Support indicators Grid */}
      <section className="border-t border-b border-gray-200 bg-white py-12" id="facilities-services-section">
        <div className="mx-auto max-w-[1536px] px-4 md:px-6 lg:px-10">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-blue">Dịch vụ tại cửa hàng</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 md:text-3xl">
                Mua hàng yên tâm hơn
            </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-500 md:text-right">
              VietBad hỗ trợ chọn đúng sản phẩm, xử lý kỹ thuật và giao hàng rõ ràng trước khi bạn ra sân.
            </p>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-4 border-b border-gray-200 p-5 sm:border-r lg:border-b-0">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand-blue" />
              <div>
                <h3 className="text-sm font-black text-gray-950">Hàng chính hãng</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">Sản phẩm có nguồn nhập rõ ràng, kiểm tra trước khi giao.</p>
              </div>
            </div>

            <div className="flex gap-4 border-b border-gray-200 p-5 lg:border-r lg:border-b-0">
              <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand-blue" />
              <div>
                <h3 className="text-sm font-black text-gray-950">Tư vấn đúng nhu cầu</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">Gợi ý vợt, giày và phụ kiện theo lối chơi, lực tay và ngân sách.</p>
              </div>
            </div>

            <div className="flex gap-4 border-b border-gray-200 p-5 sm:border-r sm:border-b-0">
              <Wrench className="mt-0.5 h-6 w-6 shrink-0 text-brand-blue" />
              <div>
                <h3 className="text-sm font-black text-gray-950">Đan vợt tại shop</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">Căng đúng số kg yêu cầu, tư vấn cước phù hợp trước khi đan.</p>
              </div>
            </div>

            <div className="flex gap-4 p-5">
              <Truck className="mt-0.5 h-6 w-6 shrink-0 text-brand-blue" />
              <div>
                <h3 className="text-sm font-black text-gray-950">Giao hàng linh hoạt</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">Hỗ trợ COD, đóng gói kỹ và gửi thông tin đơn rõ ràng.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* --- SIDEBAR PANEL DRAWER: Shopping Cart checkout --- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        vouchersApplied={vouchersApplied}
        onApplyVoucher={handleApplyVoucher}
        onRemoveVoucher={handleRemoveVoucher}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={handleClearCart}
      />

      {/* --- DIALOG MODAL: Product Details Specs --- */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? wishlist.some((item) => item.id === quickViewProduct.id) : false}
        onToggleWishlist={() => quickViewProduct && handleToggleWishlist(quickViewProduct)}
        onAddToCart={(product, qty, tension) => handleAddToCart(product, qty, tension)}
      />

      {/* --- DIALOG MODAL: Customer Orders History list logs --- */}
      <OrderHistoryModal
        orders={orders}
        consultations={consultations}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClearOrder={handleClearOrderHistory}
      />

      {/* --- GLOBAL FLOATING CUSTOM TOAST ALERT ALERTS --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3.5 shadow-2xl ${
              toastType === 'success' ? 'bg-slate-900 border border-emerald-500/25 text-white' :
              toastType === 'error' ? 'bg-red-900 border border-red-500/20 text-white' :
              'bg-slate-800 border border-blue-500/25 text-white'
            }`}
          >
            {toastType === 'success' && <div className="rounded-full bg-green-500/20 p-1 text-green-400">✓</div>}
            <span className="text-xs font-bold leading-normal">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-gray-400 hover:text-white text-xs font-bold pl-2 cursor-pointer focus:outline-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
