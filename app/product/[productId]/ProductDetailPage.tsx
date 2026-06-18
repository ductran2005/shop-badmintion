"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Heart, Home, ShieldCheck, ShoppingCart, Star, Wrench, X } from 'lucide-react';
import Header from '../../components/Header';
import CartDrawer from '../../components/CartDrawer';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import ProductDetailModal from '../../components/ProductDetailModal';
import { AVAILABLE_TENSIONS, UTILS } from '../../data';
import { CartItem, Order, Product, Voucher } from '../../types';

type ProductDetailPageProps = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductDetailPage({ product, relatedProducts }: ProductDetailPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [vouchersApplied, setVouchersApplied] = useState<Voucher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedTension, setSelectedTension] = useState(
    product.category === 'racket' ? AVAILABLE_TENSIONS[0] : undefined
  );
  const productImages = React.useMemo(
    () => [product.imageUrl, ...(product.galleryImages ?? [])].filter(Boolean) as string[],
    [product.galleryImages, product.imageUrl]
  );
  const [activeImage, setActiveImage] = useState(productImages[0]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hasLoadedStorage = useRef(false);

  useEffect(() => {
    const loadStoredState = window.setTimeout(() => {
      try {
        const storedCart = localStorage.getItem('vietbad_cart');
        if (storedCart) setCart(JSON.parse(storedCart));

        const storedWishlist = localStorage.getItem('vietbad_wishlist');
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

        const storedVouchers = localStorage.getItem('vietbad_vouchers');
        if (storedVouchers) setVouchersApplied(JSON.parse(storedVouchers));
      } catch (error) {
        console.error(error);
      } finally {
        hasLoadedStorage.current = true;
      }
    }, 0);

    return () => window.clearTimeout(loadStoredState);
  }, []);

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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleToggleWishlist = (targetProduct: Product) => {
    const isAlreadyWishlisted = wishlist.some((item) => item.id === targetProduct.id);
    setWishlist((prev) => (
      isAlreadyWishlisted
        ? prev.filter((item) => item.id !== targetProduct.id)
        : [...prev, targetProduct]
    ));
    showToast(isAlreadyWishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleAddToCart = (targetProduct: Product, amount: number, tension?: string) => {
    const cartItemId = tension ? `${targetProduct.id}-${tension}` : targetProduct.id;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex >= 0) {
        const nextCart = [...prev];
        nextCart[existingIndex].quantity += amount;
        return nextCart;
      }

      return [...prev, { id: cartItemId, product: targetProduct, quantity: amount, selectedTension: tension }];
    });

    showToast('Đã thêm sản phẩm vào giỏ hàng');
  };

  const handlePrimaryAddToCart = () => {
    handleAddToCart(product, quantity, selectedTension);
    setIsCartOpen(true);
  };

  const handleAddRelatedProduct = (targetProduct: Product) => {
    if (targetProduct.category === 'racket') {
      setQuickViewProduct(targetProduct);
      return;
    }

    handleAddToCart(targetProduct, 1);
  };

  const handleApplyVoucher = (voucher: Voucher) => {
    if (vouchersApplied.some((item) => item.code === voucher.code)) {
      showToast('Mã giảm giá đã được áp dụng');
      return;
    }

    setVouchersApplied((prev) => [...prev, voucher]);
    showToast(`Đã áp dụng mã ${voucher.code}`);
  };

  const handleOrderSuccess = (order: Order) => {
    showToast(`Đặt hàng thành công: ${order.id}`);
    setCart([]);
  };

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => showToast('Danh sách yêu thích đang được lưu trên máy của bạn')}
        onOpenOrders={() => showToast('Lịch sử đơn hàng đang ở trang chủ')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(categoryId) => {
          window.location.href = `/category/${categoryId}`;
        }}
      />

      <main className="mx-auto w-full max-w-[1536px] px-4 py-8 md:px-6 lg:px-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
          <Link href="/" className="inline-flex items-center gap-1 transition hover:text-brand-blue">
            <Home className="h-3.5 w-3.5" />
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/category/${product.category}`} className="transition hover:text-brand-blue">
            {product.categoryName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <section className="grid gap-10 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-contain p-5"
                  priority
                />
              ) : (
                <span className="select-none text-9xl drop-shadow-xl">{product.imageEmoji}</span>
              )}
              <span className="absolute bottom-4 left-4 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-black text-brand-blue">
                {product.categoryName}
              </span>
            </div>

            {productImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {productImages.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border bg-white transition ${
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
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-xs font-bold text-gray-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>Đổi mới hoàn tiền 100% khi phát hiện hàng giả</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-bold text-gray-800">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>Hỗ trợ bảo hành chính hãng 3 tháng rạn nứt</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-brand-blue">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviewsCount} đánh giá)</span>
                </div>
              </div>

              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-950 md:text-4xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-black text-red-600">
                  {UTILS.formatCurrency(product.price)}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {UTILS.formatCurrency(product.oldPrice)}
                    </span>
                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-black text-red-600">
                      -{product.discountPercent}%
                    </span>
                  </>
                )}
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-600">
                {product.description}
              </p>

              {product.category === 'racket' && (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-gray-700">
                    Chọn thông số độ căng
                  </label>
                  <select
                    value={selectedTension}
                    onChange={(event) => setSelectedTension(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  >
                    {AVAILABLE_TENSIONS.map((tension) => (
                      <option key={tension} value={tension}>
                        {tension}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Miễn phí căng cước Yonex/Victor mặc định đi kèm khung.
                  </p>
                </div>
              )}

              {product.specs && (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">
                    Thông số kỹ thuật chi tiết
                  </h2>
                  <div className="mt-4 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
                    {product.specs.weight && (
                      <SpecItem label="Trọng lượng" value={product.specs.weight} />
                    )}
                    {product.specs.balance && (
                      <SpecItem label="Điểm cân bằng" value={product.specs.balance} />
                    )}
                    {product.specs.tension && (
                      <SpecItem label="Sức căng tối đa" value={product.specs.tension} />
                    )}
                    {product.specs.stiffness && (
                      <SpecItem label="Độ cứng thân" value={product.specs.stiffness} />
                    )}
                    {product.specs.material && (
                      <SpecItem label="Vật liệu" value={product.specs.material} wide />
                    )}
                    {product.specs.origin && (
                      <SpecItem label="Nguồn gốc" value={product.specs.origin} wide />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-5">
              <div className="flex shrink-0 items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="px-4 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-100"
                  aria-label="Giảm số lượng"
                >
                  -
                </button>
                <span className="min-w-12 px-4 py-3 text-center text-sm font-black">{quantity}</span>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  className="px-4 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-100"
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleToggleWishlist(product)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                aria-label="Yêu thích sản phẩm"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>

              <button
                onClick={handlePrimaryAddToCart}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-black text-white shadow-lg shadow-brand-blue/20 transition hover:bg-brand-blue-hover active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Thêm vào giỏ hàng - {UTILS.formatCurrency(product.price * quantity)}</span>
              </button>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-blue">Gợi ý thêm</p>
                <h2 className="mt-1 text-2xl font-black text-gray-950">Sản phẩm cùng danh mục</h2>
              </div>
              <Link
                href={`/category/${product.category}`}
                className="text-sm font-black text-brand-blue hover:text-brand-blue-hover"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  isWishlisted={wishlist.some((wishlistItem) => wishlistItem.id === item.id)}
                  onToggleWishlist={() => handleToggleWishlist(item)}
                  onQuickView={() => setQuickViewProduct(item)}
                  onAddToCart={() => handleAddRelatedProduct(item)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        vouchersApplied={vouchersApplied}
        onApplyVoucher={handleApplyVoucher}
        onRemoveVoucher={(code) => setVouchersApplied((prev) => prev.filter((item) => item.code !== code))}
        onUpdateQuantity={(id, nextQuantity) => setCart((prev) => prev.map((item) => (
          item.id === id ? { ...item, quantity: nextQuantity } : item
        )))}
        onRemoveItem={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
        onOrderSuccess={handleOrderSuccess}
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

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl"
          >
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} aria-label="Đóng thông báo">
              <X className="h-4 w-4 text-gray-300" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function SpecItem({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`border-b border-gray-100 pb-2 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="block text-xs font-bold text-gray-400">{label}</span>
      <span className="mt-1 block font-bold text-gray-800">{value}</span>
    </div>
  );
}
