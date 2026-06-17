/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, HelpCircle, Check, Info, ShieldAlert, Sparkles, X, ChevronRight, Zap } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import ContactSection from './components/ContactSection';
import OrderHistoryModal from './components/OrderHistoryModal';
import { PRODUCTS, BRANDS, UTILS } from './data';
import { Product, CartItem, Voucher, Order, ConsultationRequest } from './types';

export default function App() {
  // --- Persistent State hooks with LocalStorage Fallbacks ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('vietbad_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('vietbad_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [vouchersApplied, setVouchersApplied] = useState<Voucher[]>(() => {
    try {
      const stored = localStorage.getItem('vietbad_vouchers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('vietbad_orders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [consultations, setConsultations] = useState<ConsultationRequest[]>(() => {
    try {
      const stored = localStorage.getItem('vietbad_consults');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // --- Filtering & Search States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // --- Panels Toggles / Modal triggers ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // --- Aesthetic Custom Toasts State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // --- Ticking Countdown Clock ---
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 14,
    seconds: 36
  });

  // Persistent state synchronization
  useEffect(() => {
    localStorage.setItem('vietbad_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vietbad_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('vietbad_vouchers', JSON.stringify(vouchersApplied));
  }, [vouchersApplied]);

  useEffect(() => {
    localStorage.setItem('vietbad_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vietbad_consults', JSON.stringify(consultations));
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
    const handle = setTimeout(() => {
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

  const handleAddConsultation = (request: ConsultationRequest) => {
    setConsultations((prev) => [request, ...prev]);
    showToast('Đại sứ đan vợt VietBad Store đã nhận yêu cầu tư vấn!', 'success');
  };

  // --- Filter Core logic logic computation ---
  const filteredProducts = PRODUCTS.filter((product) => {
    // 1. Live Keyword text match
    const textToSearch = `${product.name} ${product.brand} ${product.categoryName} ${product.description}`.toLowerCase();
    const matchesSearch = textToSearch.includes(searchQuery.toLowerCase());

    // 2. Category option match
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    // 3. Brand Option match
    const matchesBrand = !selectedBrand || product.brand.toLowerCase() === selectedBrand.toLowerCase();

    // 4. Wishlist filter option match
    const matchesWishlist = !showWishlistOnly || wishlist.some((item) => item.id === product.id);

    return matchesSearch && matchesCategory && matchesBrand && matchesWishlist;
  });

  const activeVouchersAppliedCount = vouchersApplied.length;

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
          setShowWishlistOnly((prev) => !prev);
          setSelectedCategory('all');
          setSelectedBrand('');
          showToast(!showWishlistOnly ? 'Hiển thị danh sách sản phẩm yêu thích của bạn' : 'Hiển thị tất cả sản phẩm', 'info');
        }}
        onOpenOrders={() => setIsHistoryOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (showWishlistOnly) setShowWishlistOnly(false);
        }}
      />

      {/* Static quick-links secondary menu bar */}
      <nav className="bg-white border-b border-gray-200 hidden sm:flex justify-center gap-10 py-3 text-xs font-black uppercase tracking-wider text-gray-700">
        <a href="#hero-section" className="hover:text-brand-blue transition">Trang chủ</a>
        <a href="#categories-section" className="hover:text-brand-blue transition">Danh mục cầu</a>
        <a href="#products-catalog-section" className="hover:text-brand-blue transition">Sản phẩm bán chạy</a>
        <a href="#flash-sale-banner-section" className="hover:text-brand-blue transition">Khuyến mãi cực hot</a>
        <a href="#facilities-services-section" className="hover:text-brand-blue transition">Dịch vụ đan vợt</a>
        <a href="#contact-section" className="hover:text-brand-blue transition">Liên hệ tư vấn</a>
      </nav>

      {/* 3. Hero Visual Graphics Spotlight & instant Coupons voucher clicking */}
      <Hero onApplyVoucher={handleApplyVoucher} />

      {/* 4. Category selective filter links */}
      <div className="bg-white py-12 border-b border-gray-105">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setShowWishlistOnly(false);
          }}
          products={PRODUCTS}
        />
      </div>

      {/* 5. Main Product Grid Section */}
      <main className="flex-1 py-14 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full" id="products-catalog-section">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-yellow" />
              <h2 className="text-2xl font-black uppercase text-gray-950 tracking-tight sm:text-3xl">
                {showWishlistOnly 
                  ? '💖 SẢN PHẨM BẠN YÊU THÍCH' 
                  : selectedCategory === 'all' 
                    ? '🏆 SẢN PHẨM BÁN CHẠY NHẤT' 
                    : `Sản phẩm nhóm: ${PRODUCTS.find(p => p.category === selectedCategory)?.categoryName || 'Tìm kiếm'}`}
              </h2>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {showWishlistOnly 
                ? 'Tìm kiếm nhanh các thiết bị vợt giày bóng bạn đã thả tim trong thời gian qua' 
                : 'Sản phẩm mới chính hãng được các lông thủ Việt Nam sử dụng phổ biến'}
            </p>
          </div>

          {/* Quick Clear filters indicator when searching or filter options applied */}
          {(selectedCategory !== 'all' || selectedBrand || searchQuery || showWishlistOnly) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('');
                setSearchQuery('');
                setShowWishlistOnly(false);
                showToast('Đã xóa tất cả bộ lọc tìm kiếm', 'info');
              }}
              className="inline-flex cursor-pointer text-xs font-extrabold text-brand-blue hover:underline uppercase items-center gap-1 focus:outline-none"
            >
              Reset bộ lọc ×
            </button>
          )}
        </div>

        {/* Brand filters pills selectors list bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-gray-600 mr-2 uppercase tracking-wide">
            🏷️ Lọc theo thương hiệu:
          </span>
          <button
            onClick={() => setSelectedBrand('')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all border ${
              !selectedBrand
                ? 'bg-brand-blue text-white border-brand-blue active'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tất cả hãng
          </button>
          {BRANDS.map((brandName) => (
            <button
              key={brandName}
              onClick={() => setSelectedBrand(selectedBrand === brandName ? '' : brandName)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all border ${
                selectedBrand === brandName
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {brandName}
            </button>
          ))}
        </div>

        {/* Catalog list grid items */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-150 py-20 text-center flex flex-col items-center justify-center">
            <span className="text-5xl mb-3">🔍</span>
            <h3 className="text-base font-black text-gray-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-sm">
              Rất tiếc, bộ lọc hiện tại của bạn không khớp với bất kỳ mặt hàng nào tại VietBad. Vui lòng thay đổi từ khóa hoặc bộ lọc thương hiệu khác.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('');
                setSearchQuery('');
                setShowWishlistOnly(false);
              }}
              className="mt-5 rounded-xl bg-brand-blue px-5 py-2.5 text-xs font-black text-white hover:bg-brand-blue-hover transition"
            >
              Hiển thị lại tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
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
        )}
      </main>

      {/* 6. Flash Sale Weekend section featuring real-time state countdown clock */}
      <section className="bg-brand-blue py-14 text-white overflow-hidden" id="flash-sale-banner-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Flash text column */}
            <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white animate-pulse">
                <Zap className="h-3 w-3 fill-white" />
                FLASH SALE CUỐI TUẦN
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                GIỜ VÀNG <br/> GIÁ SỐC!
              </h2>
              <p className="text-sm text-blue-100 max-w-md">
                Giảm sập sàn tới 30-50% cho một số mẫu vợt Lining Axforce Cannon rồng lửa và các loại phụ kiện chính hãng khác. Số lượng săn sale cực hạn!
              </p>

              {/* Countdown panel clocks ticker */}
              <div className="flex justify-center lg:justify-start gap-3 pt-2">
                <div className="flex flex-col items-center">
                  <div className="bg-white text-brand-blue h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-md">
                    {String(countdown.hours).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-100 mt-1">Giờ</span>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-4">:</div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-brand-blue h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-md">
                    {String(countdown.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-100 mt-1">Phút</span>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-4">:</div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-brand-blue h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-md">
                    {String(countdown.seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-100 mt-1">Giây</span>
                </div>
              </div>
            </div>

            {/* Flash products list grid display */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Product 1: Rồng lửa */}
              <div className="bg-white rounded-3xl border border-blue-400/25 p-5 flex flex-col justify-between text-gray-900 shadow-lg relative">
                <span className="absolute top-4 left-4 rounded-full bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase">
                  -30% Giảm
                </span>
                <div className="h-40 bg-gradient-to-b from-blue-50 to-indigo-100/50 rounded-xl flex items-center justify-center text-6xl">
                  🏸
                </div>
                <div className="mt-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue">Lining</span>
                  <h3 className="font-extrabold text-sm text-gray-900 mt-0.5 line-clamp-1">Lining Axforce Cannon 4U</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-black text-red-600">{UTILS.formatCurrency(1490000)}</span>
                    <span className="text-xs text-gray-400 line-through">{UTILS.formatCurrency(1990000)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCartDirectly(PRODUCTS.find((p) => p.id === 'p5') || PRODUCTS[4])}
                  className="mt-4 w-full bg-brand-blue text-white py-2.5 rounded-xl font-bold text-xs hover:bg-brand-blue-hover transition cursor-pointer"
                >
                  Mua Ngay Deal Hời
                </button>
              </div>

              {/* Product 2: Áo Dry fit */}
              <div className="bg-white rounded-3xl border border-blue-400/25 p-5 flex flex-col justify-between text-gray-900 shadow-lg relative">
                <span className="absolute top-4 left-4 rounded-full bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase">
                  -25% Hot
                </span>
                <div className="h-40 bg-gradient-to-b from-purple-50 to-indigo-100/30 rounded-xl flex items-center justify-center text-6xl">
                  👕
                </div>
                <div className="mt-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue">Áo thể thao</span>
                  <h3 className="font-extrabold text-sm text-gray-900 mt-0.5 line-clamp-1">Áo thi đấu Yonex Dry Fit</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-black text-red-600">{UTILS.formatCurrency(299000)}</span>
                    <span className="text-xs text-gray-400 line-through">{UTILS.formatCurrency(399000)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCartDirectly(PRODUCTS.find((p) => p.id === 'p6') || PRODUCTS[5])}
                  className="mt-4 w-full bg-brand-blue text-white py-2.5 rounded-xl font-bold text-xs hover:bg-brand-blue-hover transition cursor-pointer"
                >
                  Mua Ngay Deal Hời
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. Facilities / Promises / Support indicators Grid */}
      <section className="bg-white py-14 border-t border-b border-gray-200" id="facilities-services-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 md:text-3xl">
              CAM KẾT DỊCH VỤ VIETBAD
            </h2>
            <p className="text-xs text-gray-500 mt-1">Dịch vụ chọn mua trọn vẹn yên tâm hỗ trợ cho từng vận động viên</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 border border-gray-150 rounded-2xl bg-gray-50 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">✅</span>
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Sản phẩm chính hãng</h3>
              <p className="text-xs text-gray-600 mt-1">Đền bù tiền gấp 10 lần nếu phát hiện nhái giả, nguồn gốc rõ ràng minh bạch.</p>
            </div>

            <div className="p-6 border border-gray-150 rounded-2xl bg-gray-50 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🏸</span>
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Tư vấn lực cổ tay</h3>
              <p className="text-xs text-gray-600 mt-1">Chọn vợt tương xứng theo lực tay khỏe, trung bình dẻo hay lối công công thủ.</p>
            </div>

            <div className="p-6 border border-gray-150 rounded-2xl bg-gray-50 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🧵</span>
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Kỹ thuật đan cao cấp</h3>
              <p className="text-xs text-gray-600 mt-1">Căng cước chuẩn số kg theo yêu cầu, thắt nơ 4 nút bền không chạy dây xô lệch.</p>
            </div>

            <div className="p-6 border border-gray-150 rounded-2xl bg-gray-50 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🚚</span>
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Giao hàng hỏa tốc</h3>
              <p className="text-xs text-gray-600 mt-1">Sắp xếp ship COD nhanh chóng, kiểm tra hàng thoải mái ưng ý mới trả tiền.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer Contact layout with Consultation Form */}
      <ContactSection onAddConsultation={handleAddConsultation} />

      {/* copyright */}
      <footer className="bg-slate-950 py-6 border-t border-slate-900 text-center text-xs text-gray-500 px-4">
        <p>© 22026-2027 VIETBAD STORE - CỬA HÀNG CẦU LÔNG CHÍNH HÃNG ĐÀ NẴNG. All rights reserved.</p>
        <p className="mt-1 text-[10px] text-gray-600">Developed in compliance with React / Vite / Tailwind v4 Standard conventions.</p>
      </footer>

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
