"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Grid2X2, Home, LayoutList, Search, SlidersHorizontal, X } from 'lucide-react';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import ProductDetailModal from '../../components/ProductDetailModal';
import CartDrawer from '../../components/CartDrawer';
import Footer from '../../components/Footer';
import { BRANDS } from '../../data';
import { CartItem, Order, Product, Voucher } from '../../types';

type CategoryInfo = {
  id: string;
  name: string;
  emoji: string;
};

interface CategoryProductsPageProps {
  category: CategoryInfo;
  categories: readonly CategoryInfo[];
  products: Product[];
  allProducts: Product[];
}

type SortMode = 'default' | 'price-asc' | 'price-desc' | 'rating';
type ViewMode = 'grid' | 'list';
type FilterSectionKey =
  | 'category'
  | 'price'
  | 'brand'
  | 'racketLength'
  | 'handleLength'
  | 'swingweight'
  | 'weight'
  | 'balance'
  | 'stiffness'
  | 'playStyle'
  | 'playContent'
  | 'level'
  | 'technology';

type PriceRange = {
  id: string;
  label: string;
  min: number;
  max?: number;
};

type SpecFilterOption = {
  id: string;
  label: string;
  aliases?: string[];
};

type SpecFilterGroup = {
  key: Exclude<FilterSectionKey, 'category' | 'price' | 'brand' | 'search'>;
  title: string;
  options: SpecFilterOption[];
};

const sortLabels: Record<SortMode, string> = {
  default: 'Mặc định',
  'price-asc': 'Giá thấp đến cao',
  'price-desc': 'Giá cao đến thấp',
  rating: 'Đánh giá cao'
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const priceRanges: PriceRange[] = [
  { id: 'under-500', label: 'Giá dưới 500.000đ', min: 0, max: 500000 },
  { id: '500-1m', label: '500.000đ - 1 triệu', min: 500000, max: 1000000 },
  { id: '1-2m', label: '1 - 2 triệu', min: 1000000, max: 2000000 },
  { id: '2-3m', label: '2 - 3 triệu', min: 2000000, max: 3000000 },
  { id: 'over-3m', label: 'Giá trên 3 triệu', min: 3000000 }
];

const specFilterGroups: SpecFilterGroup[] = [
  {
    key: 'racketLength',
    title: 'Chiều dài vợt',
    options: [
      { id: '665', label: '665 mm', aliases: ['665mm', '665 mm'] },
      { id: '670', label: '670 mm', aliases: ['670mm', '670 mm'] },
      { id: '675', label: '675 mm', aliases: ['675mm', '675 mm'] }
    ]
  },
  {
    key: 'handleLength',
    title: 'Chiều dài cán vợt',
    options: [
      { id: '200', label: '200 mm', aliases: ['200mm', '200 mm'] },
      { id: '205', label: '205 mm', aliases: ['205mm', '205 mm'] },
      { id: '210', label: '210 mm', aliases: ['210mm', '210 mm'] }
    ]
  },
  {
    key: 'swingweight',
    title: 'Swingweight',
    options: [
      { id: 'under-82', label: 'Dưới 82 kg/cm2', aliases: ['duoi 82', 'dưới 82', '<82'] },
      { id: '82-84', label: '82-84 kg/cm2', aliases: ['82-84', '82 - 84'] },
      { id: '84-86', label: '84-86 kg/cm2', aliases: ['84-86', '84 - 86'] },
      { id: '86-88', label: '86-88 kg/cm2', aliases: ['86-88', '86 - 88'] },
      { id: 'over-88', label: 'Trên 88 kg/cm2', aliases: ['tren 88', 'trên 88', '>88'] }
    ]
  },
  {
    key: 'weight',
    title: 'Trọng lượng',
    options: [
      { id: '2u', label: '2U: 90 - 94g', aliases: ['2u', '90 - 94', '90-94'] },
      { id: '3u', label: '3U: 85 - 89g', aliases: ['3u', '85 - 89', '85-89'] },
      { id: '4u', label: '4U: 80 - 84g', aliases: ['4u', '80 - 84', '80-84'] },
      { id: '5u', label: '5U: 75 - 79g', aliases: ['5u', '75 - 79', '75-79'] },
      { id: 'f', label: 'F: 70 - 74g', aliases: ['f:', '70 - 74', '70-74'] },
      { id: '2f', label: '2F: 65 - 69g', aliases: ['2f', '65 - 69', '65-69'] }
    ]
  },
  {
    key: 'balance',
    title: 'Điểm cân bằng',
    options: [
      { id: 'head-light', label: 'Nhẹ Đầu', aliases: ['nhe dau', 'nhẹ đầu'] },
      { id: 'even', label: 'Cân Bằng', aliases: ['can bang', 'cân bằng'] },
      { id: 'slightly-head-heavy', label: 'Hơi Nặng Đầu', aliases: ['hoi nang dau', 'hơi nặng đầu'] },
      { id: 'head-heavy', label: 'Nặng Đầu', aliases: ['nang dau', 'nặng đầu'] },
      { id: 'super-head-heavy', label: 'Siêu Nặng Đầu', aliases: ['sieu nang dau', 'siêu nặng đầu'] }
    ]
  },
  {
    key: 'stiffness',
    title: 'Độ cứng đũa',
    options: [
      { id: 'flexible', label: 'Dẻo', aliases: ['deo', 'dẻo', 'flexible'] },
      { id: 'medium', label: 'Trung Bình', aliases: ['trung binh', 'trung bình', 'medium'] },
      { id: 'stiff', label: 'Cứng', aliases: ['cung', 'cứng', 'stiff'] },
      { id: 'extra-stiff', label: 'Siêu Cứng', aliases: ['sieu cung', 'siêu cứng', 'extra stiff'] }
    ]
  },
  {
    key: 'playStyle',
    title: 'Phong cách chơi',
    options: [
      { id: 'attack', label: 'Tấn Công', aliases: ['tan cong', 'tấn công', 'smash'] },
      { id: 'all-round', label: 'Công Thủ Toàn Diện', aliases: ['cong thu toan dien', 'công thủ toàn diện', 'all-round'] },
      { id: 'defense', label: 'Phản Tạt, Phòng Thủ', aliases: ['phan tat', 'phản tạt', 'phong thu', 'phòng thủ', 'defense'] }
    ]
  },
  {
    key: 'playContent',
    title: 'Nội dung chơi',
    options: [
      { id: 'single', label: 'Đánh Đơn', aliases: ['danh don', 'đánh đơn', 'single'] },
      { id: 'double', label: 'Đánh Đôi', aliases: ['danh doi', 'đánh đôi', 'double'] },
      { id: 'both', label: 'Cả Đơn và Đôi', aliases: ['ca don va doi', 'cả đơn và đôi'] }
    ]
  },
  {
    key: 'level',
    title: 'Trình độ chơi',
    options: [
      { id: 'beginner', label: 'Mới Chơi', aliases: ['moi choi', 'mới chơi', 'beginner'] },
      { id: 'intermediate', label: 'Trung Bình', aliases: ['trung binh', 'trung bình', 'intermediate'] },
      { id: 'good', label: 'Khá Tốt', aliases: ['kha tot', 'khá tốt', 'advanced'] }
    ]
  },
  {
    key: 'technology',
    title: 'Công nghệ',
    options: [
      { id: 'graphite', label: 'Graphite', aliases: ['graphite', 'carbon'] },
      { id: 'nano', label: 'Nano / Nanomesh', aliases: ['nano', 'nanomesh'] },
      { id: 'power', label: 'Power / trợ lực', aliases: ['power', 'tro luc', 'trợ lực'] },
      { id: 'aero', label: 'Aero / khí động học', aliases: ['aero', 'khi dong hoc', 'khí động học'] }
    ]
  }
];

function FilterSection({
  title,
  isOpen,
  onToggle,
  children
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-gray-200 first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left text-xs font-black text-gray-950"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-[11px] font-semibold leading-4 text-gray-700 transition hover:text-brand-blue">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-3 w-3 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
      />
      <span>{label}</span>
    </label>
  );
}

export default function CategoryProductsPage({
  category,
  categories,
  products,
  allProducts
}: CategoryProductsPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [vouchersApplied, setVouchersApplied] = useState<Voucher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedSpecFilters, setSelectedSpecFilters] = useState<Record<string, string[]>>({});
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<FilterSectionKey, boolean>>({
    category: true,
    price: true,
    brand: true,
    racketLength: false,
    handleLength: false,
    swingweight: false,
    weight: false,
    balance: false,
    stiffness: false,
    playStyle: false,
    playContent: false,
    level: false,
    technology: false
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const categoryCounts = useMemo(() => {
    return categories.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = allProducts.filter((product) => product.category === item.id).length;
      return acc;
    }, {});
  }, [allProducts, categories]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery.trim());
    const nextProducts = products.filter((product) => {
      const searchableText = normalizeText([
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
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesPrice = selectedPriceRanges.length === 0 || selectedPriceRanges.some((rangeId) => {
        const range = priceRanges.find((item) => item.id === rangeId);
        if (!range) return true;
        return product.price >= range.min && (range.max === undefined || product.price < range.max);
      });
      const matchesSpecs = specFilterGroups.every((group) => {
        const selectedOptions = selectedSpecFilters[group.key] ?? [];
        if (selectedOptions.length === 0) return true;

        return selectedOptions.some((optionId) => {
          const option = group.options.find((item) => item.id === optionId);
          if (!option) return true;
          const aliases = option.aliases ?? [option.label];

          return aliases.some((alias) => searchableText.includes(normalizeText(alias)));
        });
      });

      return matchesSearch && matchesBrand && matchesPrice && matchesSpecs;
    });

    return [...nextProducts].sort((a, b) => {
      if (sortMode === 'price-asc') return a.price - b.price;
      if (sortMode === 'price-desc') return b.price - a.price;
      if (sortMode === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, searchQuery, selectedBrands, selectedPriceRanges, selectedSpecFilters, sortMode]);

  const availableBrands = BRANDS.filter((brand) => products.some((product) => product.brand === brand));
  const selectedSpecCount = Object.values(selectedSpecFilters).reduce((sum, values) => sum + values.length, 0);
  const hasActiveFilters = Boolean(
    searchQuery.trim()
    || selectedBrands.length > 0
    || selectedPriceRanges.length > 0
    || selectedSpecCount > 0
    || sortMode !== 'default'
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setSelectedSpecFilters({});
    setSortMode('default');
  };

  const toggleListValue = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    ));
  };

  const toggleSpecFilter = (groupKey: SpecFilterGroup['key'], optionId: string) => {
    setSelectedSpecFilters((prev) => {
      const current = prev[groupKey] ?? [];
      const next = current.includes(optionId)
        ? current.filter((item) => item !== optionId)
        : [...current, optionId];

      return {
        ...prev,
        [groupKey]: next
      };
    });
  };

  const toggleSection = (section: FilterSectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleToggleWishlist = (product: Product) => {
    const isWishlisted = wishlist.some((item) => item.id === product.id);
    setWishlist((prev) => (
      isWishlisted ? prev.filter((item) => item.id !== product.id) : [...prev, product]
    ));
    showToast(isWishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
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

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white font-sans text-gray-900">
      <Header
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => showToast('Danh sách yêu thích đang ở trang hiện tại')}
        onOpenOrders={() => showToast('Lịch sử đơn hàng đang ở trang chủ')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(categoryId) => {
          window.location.href = `/category/${categoryId}`;
        }}
      />

      <section
        className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-slate-950 px-4 text-center text-white"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(6, 18, 38, 0.82), rgba(7, 28, 59, 0.66)), url("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1800&q=80")',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_34%)]" />
        <div className="relative">
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">{category.name}</h1>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-brand-yellow">
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <span>/</span>
            <span>{category.name}</span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1536px] grid-cols-1 gap-6 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-10">
        <aside>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-6">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left lg:pointer-events-none"
                  aria-expanded={isMobileFiltersOpen}
                  aria-controls="category-filter-panel"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
                      <SlidersHorizontal className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-black text-gray-950">Bộ lọc</h2>
                      <p className="mt-1.5 text-[11px] font-semibold text-gray-500">
                        {filteredProducts.length}/{products.length} sản phẩm phù hợp
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`ml-auto mt-1 h-4 w-4 shrink-0 text-gray-500 transition lg:hidden ${
                      isMobileFiltersOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full border border-gray-200 px-2.5 py-1 text-[10px] font-black text-gray-600 transition hover:border-brand-blue hover:text-brand-blue"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <div className={`${isMobileFiltersOpen ? 'flex' : 'hidden'} mt-3 flex-wrap gap-1.5 lg:flex`}>
                  {selectedBrands.map((brand) => (
                    <span key={brand} className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-brand-blue">
                      {brand}
                    </span>
                  ))}
                  {selectedPriceRanges.map((rangeId) => {
                    const range = priceRanges.find((item) => item.id === rangeId);
                    return range ? (
                      <span key={range.id} className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-brand-blue">
                        {range.label}
                      </span>
                    ) : null;
                  })}
                  {selectedSpecCount > 0 && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-brand-blue">
                      {selectedSpecCount} thông số
                    </span>
                  )}
                  {sortMode !== 'default' && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-brand-blue">
                      {sortLabels[sortMode]}
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="max-w-full truncate rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-brand-blue">
                      “{searchQuery.trim()}”
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              id="category-filter-panel"
              className={`${isMobileFiltersOpen ? 'block' : 'hidden'} px-4 lg:block`}
            >
              <div className="border-b border-gray-200 py-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-9 text-xs outline-none transition focus:border-brand-blue focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Xóa từ khóa"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <FilterSection
                title="Danh mục"
                isOpen={openSections.category}
                onToggle={() => toggleSection('category')}
              >
                <div className="space-y-1">
                  {categories.map((item) => {
                    const isActive = item.id === category.id;
                    return (
                      <Link
                        key={item.id}
                        href={`/category/${item.id}`}
                        className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs transition ${
                          isActive
                            ? 'border-blue-100 bg-blue-50 font-black text-brand-blue'
                            : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-brand-blue'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-brand-blue' : 'bg-gray-300'}`} />
                          {item.name}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          isActive ? 'bg-white text-brand-blue' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {categoryCounts[item.id] || 0}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection
                title="Chọn mức giá"
                isOpen={openSections.price}
                onToggle={() => toggleSection('price')}
              >
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <FilterCheckbox
                      key={range.id}
                      label={range.label}
                      checked={selectedPriceRanges.includes(range.id)}
                      onChange={() => toggleListValue(range.id, setSelectedPriceRanges)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="Thương hiệu"
                isOpen={openSections.brand}
                onToggle={() => toggleSection('brand')}
              >
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedBrands([])}
                    className={`rounded-full border px-2.5 py-1.5 text-[11px] font-black transition ${
                      selectedBrands.length === 0 ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-200 text-gray-700 hover:border-brand-blue'
                    }`}
                  >
                    Tất cả
                  </button>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleListValue(brand, setSelectedBrands)}
                      className={`rounded-full border px-2.5 py-1.5 text-[11px] font-black transition ${
                        selectedBrands.includes(brand) ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-200 text-gray-700 hover:border-brand-blue'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {category.id === 'racket' && specFilterGroups.map((group) => (
                <FilterSection
                  key={group.key}
                  title={group.title}
                  isOpen={openSections[group.key]}
                  onToggle={() => toggleSection(group.key)}
                >
                  <div className="space-y-2">
                    {group.options.map((option) => (
                      <FilterCheckbox
                        key={option.id}
                        label={option.label}
                        checked={(selectedSpecFilters[group.key] ?? []).includes(option.id)}
                        onChange={() => toggleSpecFilter(group.key, option.id)}
                      />
                    ))}
                  </div>
                </FilterSection>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                {filteredProducts.length} sản phẩm
              </p>
              <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-gray-950">
                {category.name}
              </h2>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 sm:flex-none">
                <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none sm:flex-none"
                >
                  <option value="default">Thứ tự mặc định</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>

              <button
                onClick={() => setViewMode('grid')}
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  viewMode === 'grid' ? 'border-brand-blue text-brand-blue' : 'border-gray-200 text-gray-500'
                }`}
                aria-label="Xem dạng lưới"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  viewMode === 'list' ? 'border-brand-blue text-brand-blue' : 'border-gray-200 text-gray-500'
                }`}
                aria-label="Xem dạng danh sách"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <p className="text-lg font-black text-gray-900">Chưa tìm thấy sản phẩm phù hợp</p>
              <p className="mt-2 text-sm text-gray-600">Thử đổi thương hiệu, từ khóa hoặc thứ tự sắp xếp.</p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4'
                  : 'grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'
              }
            >
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
        </section>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        vouchersApplied={vouchersApplied}
        onApplyVoucher={handleApplyVoucher}
        onRemoveVoucher={(code) => setVouchersApplied((prev) => prev.filter((item) => item.code !== code))}
        onUpdateQuantity={(id, q) => setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: q } : item))}
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

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.94 }}
              className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl"
            >
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} aria-label="Đóng thông báo">
                <X className="h-4 w-4 text-gray-300" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
