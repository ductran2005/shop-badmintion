import type { Metadata } from 'next';
import ProductCollectionPage from '../components/ProductCollectionPage';
import { PRODUCTS } from '../data';

export const metadata: Metadata = {
  title: 'Khuyến mãi cực hot - VIETBAD STORE',
  description: 'Các sản phẩm cầu lông đang giảm giá mạnh tại VIETBAD STORE.'
};

export default function PromotionsPage() {
  const products = PRODUCTS.filter((product) => product.isSale);
  const highestDiscount = Math.max(...products.map((product) => product.discountPercent || 0));

  return (
    <ProductCollectionPage
      eyebrow="Khuyến mãi cực hot"
      title="Sale nhanh cho đồ cầu lông đáng mua"
      description="Các mẫu đang có giá tốt trong tuần, phù hợp để nâng cấp vợt, đổi giày hoặc mua thêm phụ kiện tập luyện trước buổi ra sân."
      heroImage="/banner/33f677f6-6ae8-4a78-beef-4bb4d236c170.png"
      products={products}
      badges={['Giá đã giảm', 'Số lượng có hạn', 'Có hỗ trợ COD']}
      stats={[
        { label: 'Món đang sale', value: String(products.length) },
        { label: 'Giảm đến', value: `${highestDiscount}%` },
        { label: 'Freeship từ', value: '499K' }
      ]}
    />
  );
}
