/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Link from 'next/link';

const footerColumns = [
  {
    title: 'Danh mục',
    links: [
      { label: 'Giới thiệu', href: '/#facilities-services-section' },
      { label: 'Sản phẩm', href: '/#all-products-section' },
      { label: 'Tin tức', href: '/#flash-sale-banner-section' },
      { label: 'Liên hệ', href: '/#contact-section' }
    ]
  },
  {
    title: 'Liên kết',
    links: [
      { label: 'Điều khoản và điều kiện', href: '/' },
      { label: 'Kiểm tra đơn hàng', href: '/' },
      { label: 'Hệ thống cửa hàng', href: '/#contact-section' },
      { label: 'Liên hệ hỗ trợ', href: '/#contact-section' }
    ]
  },
  {
    title: 'Chính sách',
    links: [
      { label: 'Chính sách bảo mật', href: '/' },
      { label: 'Chính sách tài khoản', href: '/' },
      { label: 'Chính sách thanh toán', href: '/' },
      { label: 'Chính sách đổi trả', href: '/' }
    ]
  }
];

const socialLinks = [
  { label: 'Facebook', shortLabel: 'f', href: 'https://facebook.com' },
  { label: 'X', shortLabel: 'x', href: 'https://x.com' },
  { label: 'Instagram', shortLabel: '◎', href: 'https://instagram.com' },
  { label: 'Pinterest', shortLabel: 'p', href: 'https://pinterest.com' }
];

export default function Footer() {
  return (
    <footer id="contact-section" className="bg-[#235f99] text-white">
      <div className="mx-auto grid max-w-[1536px] grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-[1.4fr_0.8fr_1.1fr_1.1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center text-3xl font-black tracking-tight">
            <span className="text-white">VIETBAD</span>
            <span className="text-brand-yellow">STORE</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm font-semibold leading-5 text-white/95">
            Chúng tôi cung cấp vợt, giày và phụ kiện cầu lông chính hãng, giúp bạn chọn đúng sản phẩm cho phong cách chơi của mình.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-base font-black">{column.title}</h3>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-white/95">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-brand-yellow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-base font-black">Mạng xã hội</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/90 text-sm font-black uppercase transition hover:bg-white hover:text-[#235f99]"
              >
                {link.shortLabel}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 px-4 py-5 text-center text-xs font-bold text-white/95">
        © Copyright by VIETBADSTORE | Provided by VietBad VietNam
      </div>
    </footer>
  );
}
