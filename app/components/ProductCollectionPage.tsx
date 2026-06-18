"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpDown, Home, Search, X } from 'lucide-react';
import Header from './Header';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import { BRANDS } from '../data';
import { CartItem, Order, Product, Voucher } from '../types';

type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount';

const CATEGORY_GROUPS = [
  { label: 'Vợt cầu lông',  category: 'racket',      href: '/category/racket' },
  { label: 'Giày cầu lông', category: 'shoes',       href: '/category/shoes' },
  { label: 'Áo cầu lông',   category: 'shirt',       href: '/category/shirt' },
  { label: 'Váy cầu lông',  category: 'skirt',       href: '/category/skirt' },
  { label: 'Quần cầu lông', category: 'pants',       href: '/category/pants' },
  { label: 'Túi & Balo',    category: 'bag',         href: '/category/bag' },
  { label: 'Phụ kiện',      category: 'accessories', href: '/category/accessories' },
] as const;

interface ProductCollectionPageProps {
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  products: Product[];
  stats: Array<{ label: string; value: string }>;
  badges?: string[];
  groupByCategory?: boolean;
}

const sortLabels: Record<SortMode, string> = {
  featured: 'Nổi bật',
  'price-asc': 'Giá thấp đến cao',
  'price-desc': 'Giá cao đến thấp',
  rating: 'Đánh giá cao',
  discount: 'Giảm sâu'
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

export default function ProductCollectionPage({
  eyebrow,
  title,
  description,
  heroImage,
  products,
  stats,
  badges = [],
  groupByCategory = false
}: ProductCollectionPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [vouchersApplied, setVouchersApplied] = useState<Voucher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2800);
  };

  const availableBrands = BRANDS.filter((brand) => products.some((product) => product.brand === brand));

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery.trim());
    const nextProducts = products.filter((product) => {
      const searchableText = normalizeText([
        product.name,
        product.brand,
        product.categoryName,
        product.description
      ].join(' '));

      return (
        (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
        (!selectedBrand || product.brand === selectedBrand)
      );
    });

    return [...nextProducts].sort((a, b) => {
      if (sortMode === 'price-asc') return a.price - b.price;
      if (sortMode === 'price-desc') return b.price - a.price;
      if (sortMode === 'rating') return b.rating - a.rating;
      if (sortMode === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
      return 0;
    });
  }, [products, searchQuery, selectedBrand, sortMode]);

  const categoryGroups = useMemo(() =>
    CATEGORY_GROUPS.map((g) => ({
      ...g,
      products: products
        .filter((p) => p.category === g.category && p.isSale)
        .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
        .slice(0, 5),
    })).filter((g) => g.products.length >= 2),
  [products]);

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    setWishlist((prev) => exists ? prev.filter((item) => item.id !== product.id) : [...prev, product]);
    showToast(exists ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleAddToCart = (product: Product, quantity: number, tension?: string) => {
    const cartItemId = tension ? `${product.id}-${tension}` : product.id;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex >= 0) {
        const nextCart = [...prev];
        nextCart[existingIndex].quantity += quantity;
        return nextCart;
      }

      return [...prev, { id: cartItemId, product, quantity, selectedTension: tension }];
    });
    showToast('Đã thêm sản phẩm vào giỏ hàng');
  };

  const handleAddToCartDirectly = (product: Product) => {
    if (product.category === 'racket') {
      setQuickViewProduct(product);
      return;
    }

    handleAddToCart(product, 1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSortMode('featured');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => showToast('Danh sách yêu thích đang được lưu trên trang này')}
        onOpenOrders={() => showToast('Lịch sử đơn hàng đang ở trang chủ')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(categoryId) => {
          window.location.href = `/category/${categoryId}`;
        }}
      />

      <section
        className="relative overflow-hidden bg-slate-950 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(4, 17, 38, 0.9), rgba(0, 91, 170, 0.58)), url("${heroImage}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="mx-auto grid min-h-[390px] max-w-[1536px] items-end gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          <div>
            <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/85 hover:text-brand-yellow">
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-yellow">{eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-blue-50 md:text-base">{description}</p>
            {badges.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-black uppercase backdrop-blur">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-white/20 bg-white/12 text-center backdrop-blur">
            {stats.map((stat) => (
              <div key={stat.label} className="border-r border-white/15 px-4 py-6 last:border-r-0">
                <div className="text-2xl font-black text-brand-yellow">{stat.value}</div>
                <div className="mt-1 text-[11px] font-bold uppercase leading-4 text-white/85">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1536px] px-4 py-12 md:px-6 lg:px-10">
        <div className="mb-8 grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tên sản phẩm, thương hiệu, mô tả..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm font-medium outline-none transition focus:border-brand-blue focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={selectedBrand}
            onChange={(event) => setSelectedBrand(event.target.value)}
            className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-brand-blue"
          >
            <option value="">Tất cả thương hiệu</option>
            {availableBrands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="bg-transparent text-sm font-bold outline-none"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">{filteredProducts.length}/{products.length} sản phẩm</p>
            <h2 className="mt-1 text-2xl font-black text-gray-950">Danh sách sản phẩm</h2>
          </div>
          {(searchQuery || selectedBrand || sortMode !== 'featured') && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-black uppercase text-gray-600 transition hover:border-brand-blue hover:text-brand-blue"
            >
              Xóa lọc
            </button>
          )}
        </div>

        {groupByCategory && !searchQuery && !selectedBrand ? (
          <div className="space-y-12">
            {categoryGroups.map((group) => (
              <section key={group.category}>
                <div className="mb-5 flex items-center gap-2.5">
                  <span className="h-6 w-1 rounded-full bg-brand-blue" />
                  <h3 className="text-lg font-black text-gray-950">{group.label}</h3>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase text-red-600">
                    {group.products.length} SP
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  {group.products.map((product) => (
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
              </section>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-lg font-black text-gray-950">Chưa có sản phẩm phù hợp</p>
            <p className="mt-2 text-sm text-gray-500">Thử đổi từ khóa, thương hiệu hoặc cách sắp xếp.</p>
          </div>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        vouchersApplied={vouchersApplied}
        onApplyVoucher={(voucher) => {
          if (vouchersApplied.some((item) => item.code === voucher.code)) {
            showToast('Mã giảm giá đã được áp dụng');
            return;
          }
          setVouchersApplied((prev) => [...prev, voucher]);
          showToast(`Đã áp dụng mã ${voucher.code}`);
        }}
        onRemoveVoucher={(code) => setVouchersApplied((prev) => prev.filter((item) => item.code !== code))}
        onUpdateQuantity={(id, quantity) => setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity } : item).filter((item) => item.quantity > 0))}
        onRemoveItem={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
        onOrderSuccess={(order: Order) => {
          showToast(`Đặt hàng thành công: ${order.id}`);
          setCart([]);
        }}
        onClearCart={() => setCart([])}
      />

      <ProductDetailModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? wishlist.some((item) => item.id === quickViewProduct.id) : false}
        onToggleWishlist={() => quickViewProduct && handleToggleWishlist(quickViewProduct)}
        onAddToCart={handleAddToCart}
      />

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.94 }}
              className="rounded-lg bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
