/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Voucher } from '../types';

interface HeroProps {
  onApplyVoucher: (voucher: Voucher) => void;
}

const bannerImages = [
  {
    src: '/banner/badminton-promo-text-banner-v3.png',
    alt: 'Banner BST cau long moi VietBad Store'
  },
  {
    src: '/banner/vietbad-badminton-sale-banner.png',
    alt: 'Banner khuyen mai do cau long VietBad Store'
  },
  {
    src: '/banner/6db34bd8-0b49-4e54-8474-ba0a8b36c925.png',
    alt: 'Banner khuyen mai VietBad Store 2'
  }
];

const AUTO_SLIDE_DELAY = 5000;
const SWIPE_THRESHOLD = 56;

export default function Hero(_props: HeroProps) {
  void _props;

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDraggingSlide, setIsDraggingSlide] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const totalBanners = bannerImages.length;
  const canSlide = totalBanners > 1;

  const goToBanner = useCallback(
    (index: number) => {
      setActiveIndex((index + totalBanners) % totalBanners);
    },
    [totalBanners]
  );

  const goToPrevious = useCallback(() => {
    goToBanner(activeIndex - 1);
  }, [activeIndex, goToBanner]);

  const goToNext = useCallback(() => {
    goToBanner(activeIndex + 1);
  }, [activeIndex, goToBanner]);

  useEffect(() => {
    if (!canSlide) return;

    const timer = window.setInterval(goToNext, AUTO_SLIDE_DELAY);
    return () => window.clearInterval(timer);
  }, [canSlide, goToNext]);

  const finishDrag = useCallback(() => {
    if (!isDragging.current) return;

    if (dragOffset > SWIPE_THRESHOLD) {
      goToPrevious();
    } else if (dragOffset < -SWIPE_THRESHOLD) {
      goToNext();
    }

    isDragging.current = false;
    dragStartX.current = null;
    setDragOffset(0);
    setIsDraggingSlide(false);
  }, [dragOffset, goToNext, goToPrevious]);

  return (
    <section
      id="hero-section"
      aria-label="Banner VietBad Store"
      className="relative mx-3 my-4 min-h-[140px] w-[calc(100%-1.5rem)] overflow-hidden rounded-2xl bg-brand-blue shadow-sm sm:mx-6 sm:w-[calc(100%-3rem)] md:mx-auto md:w-[calc(100%-3rem)] md:max-w-[1536px] lg:w-[calc(100%-5rem)]"
      style={{ aspectRatio: '1960 / 802' }}
      onPointerDown={(event) => {
        if (!canSlide) return;
        isDragging.current = true;
        setIsDraggingSlide(true);
        dragStartX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!isDragging.current || dragStartX.current === null) return;
        setDragOffset(event.clientX - dragStartX.current);
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerLeave={finishDrag}
    >
      <div
        className="absolute inset-0 flex touch-pan-y select-none transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(calc(${-activeIndex * 100}% + ${dragOffset}px))`,
          transitionDuration: isDraggingSlide ? '0ms' : undefined
        }}
      >
        {bannerImages.map((banner, index) => (
          <div
            className="relative h-full w-full shrink-0"
            key={banner.src}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.src}
              alt={banner.alt}
              className="h-full w-full object-contain object-center"
              draggable={false}
              loading={index === 0 ? 'eager' : 'lazy'}
              onDragStart={(event) => event.preventDefault()}
            />
          </div>
        ))}
      </div>

      {canSlide && (
        <>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {bannerImages.map((banner, index) => (
              <button
                type="button"
                key={banner.src}
                onClick={() => goToBanner(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-8 bg-brand-yellow' : 'w-2.5 bg-white/75 hover:bg-white'
                }`}
                aria-label={`Chuyen den banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
