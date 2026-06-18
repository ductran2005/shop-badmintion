/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { CATEGORIES } from '../data';
import { Product } from '../types';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
}

const categoryTiles: Record<string, { image: string; label: string; imageClass?: string }> = {
  racket: {
    image: '/logo/image.png',
    label: 'VỢT CẦU LÔNG'
  },
  shoes: {
    image: '/logo/image copy.png',
    label: 'GIÀY CẦU LÔNG'
  },
  shirt: {
    image: '/logo/image copy 2.png',
    label: 'ÁO CẦU LÔNG'
  },
  skirt: {
    image: '/logo/image copy 4.png',
    label: 'VÁY CẦU LÔNG'
  },
  pants: {
    image: '/logo/image copy 3.png',
    label: 'QUẦN CẦU LÔNG'
  },
  bag: {
    image: '/logo/image copy 5.png',
    label: 'TÚI VỢT CẦU LÔNG'
  },
  backpack: {
    image: '/logo/image copy 6.png',
    label: 'BALO CẦU LÔNG'
  },
  accessories: {
    image: '/logo/image copy 7.png',
    label: 'PHỤ KIỆN CẦU LÔNG'
  }
};

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  products: _products
}: CategoryFilterProps) {
  void _products;

  const visibleCategories = CATEGORIES.filter((cat) => cat.id !== 'all');

  return (
    <div className="mx-auto max-w-[1536px] px-4 md:px-6 lg:px-10" id="categories-section">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-medium text-brand-blue md:text-3xl">
          Sản phẩm cầu lông
        </h2>
        <div className="mx-auto mt-4 flex h-1 w-36 overflow-hidden rounded-full bg-gray-200">
          <span className="mx-auto h-full w-11 rounded-full bg-brand-yellow" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {visibleCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const tile = categoryTiles[cat.id] ?? {
            image: cat.imageUrl ?? '/logo/image.png',
            label: cat.name.toUpperCase()
          };

          return (
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              key={cat.id}
              id={`cat-filter-btn-${cat.id}`}
            >
              <Link
                href={`/category/${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative block aspect-[1.18] cursor-pointer overflow-hidden rounded-sm bg-slate-950 shadow-sm transition-all ${
                  isActive ? 'ring-4 ring-blue-100' : 'hover:shadow-lg'
                }`}
                aria-label={cat.name}
              >
                <Image
                  src={tile.image}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className={`object-cover object-center transition duration-500 group-hover:scale-105 ${tile.imageClass ?? ''}`}
                />

                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent px-4 pb-4 pt-12">
                  <span className="block text-center text-sm font-black uppercase leading-tight text-white drop-shadow sm:text-base">
                    {tile.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
