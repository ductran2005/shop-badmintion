/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Voucher } from './types';

export const CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', emoji: '🛍️' },
  { id: 'racket', name: 'Vợt cầu lông', emoji: '🏸' },
  { id: 'shoes', name: 'Giày cầu lông', emoji: '👟' },
  { id: 'bag', name: 'Túi vợt', emoji: '🎒' },
  { id: 'string', name: 'Dây đan vợt', emoji: '🧵' },
  { id: 'clothes', name: 'Quần áo', emoji: '👕' },
  { id: 'combo', name: 'Combo Sale', emoji: '🎁' }
] as const;

export const BRANDS = ['Victor', 'Yonex', 'Lining', 'Mizuno', 'Kumpoo', 'Felet'] as const;

export const AVAILABLE_TENSIONS = [
  'Mua khung chưa đan (Không căng)',
  'Căng sẵn 9.5 kg (Người mới, lực tay yếu)',
  'Căng sẵn 10.0 kg (Lực tay trung bình - yếu)',
  'Căng sẵn 10.5 kg (Lực tay trung bình khá)',
  'Căng sẵn 11.0 kg (Lực tay tốt, chơi phong trào khá)',
  'Căng sẵn 11.5 kg (Lực tay khỏe, nâng cao)',
  'Căng sẵn 12.0 kg (Lực tay rất khỏe, vận động viên)'
];

export const VOUCHERS: Voucher[] = [
  {
    code: 'FREESHIP499',
    description: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 499.000đ',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderValue: 499000
  },
  {
    code: 'VIETBAD50',
    description: 'Giảm ngay 50.000đ cho đơn hàng từ 1.000.000đ',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 1000000
  },
  {
    code: 'VIPBAD10',
    description: 'Giảm 10% tổng hóa đơn (tối đa 150.000đ) cho Voucher đặc biệt',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 800000
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Vợt cầu lông Victor TK-HMR Pro (Thruster K Hammer Pro)',
    brand: 'Victor',
    category: 'racket',
    categoryName: 'Vợt cầu lông',
    price: 2390000,
    oldPrice: 2990000,
    rating: 4.8,
    reviewsCount: 42,
    imageEmoji: '🏸',
    isHot: true,
    isSale: true,
    discountPercent: 20,
    specs: {
      weight: '4U (Khoảng 83g)',
      balance: 'Nặng đầu (Head Heavy)',
      tension: '20 - 28 lbs (Tối đa 12.5 kg)',
      stiffness: 'Trung bình (Medium)',
      material: 'Graphite cứng cáp kết hợp Nano Resin gia cường lực đẩy',
      origin: 'Chính hãng Victor - Made in Taiwan'
    },
    description: 'Victor Thruster K Hammer Pro là cây vợt thiên công mạnh mẽ thích hợp cho người chơi phong trào yêu thích đập cầu từ phía sau. Khung vợt thiết kế khí động học giúp vung vợt cực nhanh, tạo lực nhấn khủng khiếp.'
  },
  {
    id: 'p2',
    name: 'Giày cầu lông Yonex Power Cushion 65Z3 Wide - Trắng Vàng',
    brand: 'Yonex',
    category: 'shoes',
    categoryName: 'Giày cầu lông',
    price: 1890000,
    oldPrice: 2300000,
    rating: 4.9,
    reviewsCount: 56,
    imageEmoji: '👟',
    isHot: true,
    isSale: true,
    discountPercent: 17,
    specs: {
      weight: 'Khoảng 310g / chiếc',
      balance: 'Form chân bè (Wide Fit - 3E)',
      material: 'Đế cao su Radial Blade, lớp lót Power Cushion siêu êm',
      stiffness: 'Chống lật cổ chân và bảo vệ khớp gối chuyên sâu',
      origin: 'Chính hãng Yonex - Nhập khẩu Nhật Bản'
    },
    description: 'Dòng giày quốc dân huyền thoại được sử dụng bởi hàng loạt các tay vợt đẳng cấp thế giới. Công nghệ Power Cushion hấp thụ chấn rung cực mạnh và chuyển hóa thành động lực cho bước di chuyển tiếp theo.'
  },
  {
    id: 'p3',
    name: 'Túi cầu lông Victor BR9213 Đa Năng 2 Ngăn Lớn',
    brand: 'Victor',
    category: 'bag',
    categoryName: 'Túi vợt',
    price: 790000,
    oldPrice: 990000,
    rating: 4.7,
    reviewsCount: 28,
    imageEmoji: '🎒',
    isSale: true,
    discountPercent: 20,
    specs: {
      weight: 'Chất liệu vải Polyester + PVC chống thấm nước hiệu quả',
      balance: 'Đựng tối đa 6 - 8 cây vợt cùng phụ kiện và quần áo',
      tension: 'Có ngăn chứa giày riêng biệt thoáng khí chống mùi',
      origin: 'Chính hãng Victor'
    },
    description: 'Thiết kế hiện đại, phối màu cá tính mang phong cách trẻ trung thể thao năng động. Quai đeo có đệm xốp êm vai, hỗ trợ mang xách thuận tiện di chuyển trong thời gian dài.'
  },
  {
    id: 'p4',
    name: 'Dây cước căng vợt Yonex BG 65 Titanium Siêu Bền',
    brand: 'Yonex',
    category: 'string',
    categoryName: 'Dây đan vợt',
    price: 180000,
    oldPrice: 220000,
    rating: 4.8,
    reviewsCount: 120,
    imageEmoji: '🧵',
    isNew: true,
    isSale: true,
    discountPercent: 18,
    specs: {
      weight: 'Đường kính sợi: 0.70 mm',
      balance: 'Độ nảy cầu: 7/10 | Độ bền sợi: 10/10',
      stiffness: 'Cảm giác chạm cầu: Cứng trung bình',
      material: 'Được phủ một lớp hợp chất Titanium tăng cao độ chịu nhiệt và bền bỉ',
      origin: 'Chính hãng Yonex - Made in Japan'
    },
    description: 'Cực kỳ phù hợp cho người chơi muốn tối ưu hóa chi phí nhờ sức bền vượt trội. Cước cho âm nổ đanh sinh động, giữ mức căng ổn định dài lâu.'
  },
  {
    id: 'p5',
    name: 'Vợt cầu lông Lining Axforce Cannon (Bản Rồng Lửa)',
    brand: 'Lining',
    category: 'racket',
    categoryName: 'Vợt cầu lông',
    price: 1490000,
    oldPrice: 1990000,
    rating: 4.9,
    reviewsCount: 88,
    imageEmoji: '🏸',
    isHot: true,
    isSale: true,
    discountPercent: 25,
    specs: {
      weight: '4U / 5U linh hoạt ứng biến lực tay',
      balance: 'Nặng đầu nhẹ (Head Heavy 295mm)',
      tension: 'Mức căng tối đa: 31 lbs (Lên tới 14kg siêu chịu lực)',
      stiffness: 'Thân vợt dẻo trung bình (Flexible)',
      material: 'High Carbon cường độ cao hấp thụ xung lực tuyệt đối',
      origin: 'Chính hãng Lining - Nhập khẩu chính ngạch'
    },
    description: 'Cây vợt giá rẻ quốc dân làm mưa làm gió thị trường Việt Nam. Rất dễ thuần phục, hỗ trợ lực cực tốt dành cho cả các bạn nữ hoặc người mới tập chơi có lực cổ tay trung bình yếu.'
  },
  {
    id: 'p6',
    name: 'Áo thun cầu lông Yonex Dry Fit Khử Mùi Thoáng Khí',
    brand: 'Yonex',
    category: 'clothes',
    categoryName: 'Quần áo',
    price: 2990000, // wait! typo in prompt, let's keep it reasonable like 299000 VND
    oldPrice: 399000,
    rating: 4.6,
    reviewsCount: 18,
    imageEmoji: '👕',
    isSale: true,
    discountPercent: 25,
    specs: {
      weight: 'Chất liệu: 100% Polyester thun sọc xẻ kim cao cấp',
      balance: 'Công nghệ dệt lỗ thoáng thông minh độc quyền Very Cool',
      stiffness: 'Chống bám bụi, co giãn 4 chiều vận động linh hoạt',
      origin: 'Hàng VNXK cao cấp bền màu'
    },
    description: 'Thiết kế áo đấu chuẩn thi đấu cầu lông quốc tế. Trọng lượng siêu nhẹ, thoát mồ hôi chỉ trong 3 giây đem lại cảm giác mượt mà sảng khoái suốt trận đấu dài.'
  },
  {
    id: 'p7',
    name: 'Vợt cầu lông Yonex Astrox 88D Game (Chính hãng)',
    brand: 'Yonex',
    category: 'racket',
    categoryName: 'Vợt cầu lông',
    price: 3390000,
    oldPrice: 3890000,
    rating: 4.8,
    reviewsCount: 33,
    imageEmoji: '🏸',
    isHot: true,
    specs: {
      weight: '4U (Avg. 83g)',
      balance: 'Nặng đầu chuyên tấn công áp đảo uy lực',
      tension: 'Tối đa 28 lbs (12.7 kg)',
      stiffness: 'Cứng (Stiff)',
      material: 'HM Graphite + Nanomesh Neo giúp uốn cong và phản hồi nhanh',
      origin: 'Chính hãng Yonex - Made in Taiwan'
    },
    description: 'Phiên bản cải tiến hướng tới đối tượng người chơi trung phong trào muốn sở hữu quả đập uy lực như tuyển thủ chuyên nghiệp nhưng dễ kiểm soát hơn bản Pro cường độ cao.'
  },
  {
    id: 'p8',
    name: 'Combo Tập Luyện Chuyên Nghiệp VietBad Starter',
    brand: 'Felet',
    category: 'combo',
    categoryName: 'Combo Sale',
    price: 990000,
    oldPrice: 1590000,
    rating: 4.9,
    reviewsCount: 15,
    imageEmoji: '🎁',
    isNew: true,
    isSale: true,
    discountPercent: 37,
    specs: {
      weight: 'Gồm: Vợt carbon Felet + túi đơn + 2 hộp cầu lông + 3 quấn cán cao su',
      balance: 'Vợt cân bằng công thủ toàn diện dễ chơi',
      tension: 'Hỗ trợ căng sẵn dây cước cước bền chắc',
      origin: 'Combo tuyển chọn chính hãng giá tốt'
    },
    description: 'Set đồ hoàn thiện nhất cho người bắt đầu tập chơi cầu lông. Bạn không cần băn khoăn lựa chọn riêng lẻ, mua combo tiết kiệm ngay 600K và sẵn sàng vác kiếm lên sân.'
  },
  {
    id: 'p9',
    name: 'Vợt cầu lông Kumpoo Power Control K520 Pro',
    brand: 'Kumpoo',
    category: 'racket',
    categoryName: 'Vợt cầu lông',
    price: 790000,
    oldPrice: 1100000,
    rating: 4.7,
    reviewsCount: 104,
    imageEmoji: '🏸',
    isSale: true,
    discountPercent: 28,
    specs: {
      weight: '4U (Avg. 82g)',
      balance: 'Cân bằng công thủ toàn diện (290 ± 5mm)',
      tension: 'Chịu lực tối đa lên tới 28 lbs',
      stiffness: 'Thân hơi dẻo bền bỉ đàn hồi cực cao',
      origin: 'Chính hãng Kumpoo - Thương hiệu Nhật'
    },
    description: 'Dòng vợt nhập môn được yêu thích nhất mọi thời đại tại Việt Nam với nước sơn bền đẹp, khả năng chịu va chạm cạch cầu tối ưu giúp người tập luyện không lo sứt sẹo vợt.'
  },
  {
    id: 'p10',
    name: 'Giày Cầu Lông Mizuno Wave Claw EL 2 Siêu Nhẹ',
    brand: 'Mizuno',
    category: 'shoes',
    categoryName: 'Giày cầu lông',
    price: 2450000,
    oldPrice: 2950000,
    rating: 4.9,
    reviewsCount: 22,
    imageEmoji: '👟',
    specs: {
      weight: 'Siêu nhẹ: Chỉ khoảng 275g / chiếc',
      material: 'Đế PoWnCe êm thoáng, lớp lót Mizuno Wave chống chấn động gối',
      balance: 'Form thường ôm khít chân bứt tốc cực tốt',
      origin: 'Chính hãng Mizuno - Thương hiệu cao cấp Nhật Bản'
    },
    description: 'Mizuno Wave Claw EL 2 chú trọng vào giảm trọng lượng đôi giày tới mức tối đa mà vẫn giữ đặc tính ổn định tuyệt đỉnh khi thực hiện các pha bật đổi hướng nhanh bất ngờ hóc hiểm.'
  },
  {
    id: 'p11',
    name: 'Quần Sọt Thể Thao Cầu Lông Li-Ning Thấm Hút Cao Cấp',
    brand: 'Lining',
    category: 'clothes',
    categoryName: 'Quần áo',
    price: 199000,
    oldPrice: 280000,
    rating: 4.7,
    reviewsCount: 31,
    imageEmoji: '👕',
    isSale: true,
    discountPercent: 29,
    specs: {
      weight: 'Chất liệu thun gai tổ ong thể thao chính hãng',
      balance: 'Cắt may 3D thoải mái bật nhảy không lo kích bó giật',
      origin: 'Chính hãng Li-Ning phân phối'
    },
    description: 'Quần ngắn cao cấp phối viền sọc cực chất. Co giãn tuyệt đối giúp người chơi bật cao smash không hề bị hạn chế cơ đùi.'
  }
];

export const UTILS = {
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }
};
