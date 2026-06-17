/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../data';
import { Product } from '../types';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  products
}: CategoryFilterProps) {

  // Compute counts for each category dynamically
  const getProductCount = (categoryId: string) => {
    if (categoryId === 'all') {
      return products.length;
    }
    return products.filter((p) => p.category === categoryId).length;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8" id="categories-section">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold uppercase tracking-tight text-gray-900 md:text-4xl">
          DANH MỤC SẢN PHẨM
        </h2>
        <div className="mx-auto mt-2 h-1.5 w-20 rounded bg-brand-blue" />
        <p className="mt-3 text-sm text-gray-600">
          Tìm kiếm nhanh vơt và đồ chơi cầu lông phù hợp phong cách chơi bóng của bạn
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = getProductCount(cat.id);

          return (
            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={cat.id}
              id={`cat-filter-btn-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex cursor-pointer flex-col items-center justify-between rounded-2xl p-5 text-center transition-all ${
                isActive
                  ? 'bg-brand-blue text-white shadow-lg ring-4 ring-blue-100'
                  : 'bg-white text-gray-800 border border-gray-150 shadow-sm hover:border-brand-blue/30'
              }`}
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              
              <div>
                <h3 className="text-sm font-extrabold tracking-tight leading-snug line-clamp-2">
                  {cat.name}
                </h3>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-orange-600/30 text-brand-yellow' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count} SP
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
