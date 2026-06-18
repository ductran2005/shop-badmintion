import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PRODUCTS } from '../../data';
import ProductDetailPage from './ProductDetailPage';

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    productId: product.id
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = PRODUCTS.find((item) => item.id === productId);

  if (!product) {
    return {
      title: 'Sản phẩm - VIETBAD STORE'
    };
  }

  return {
    title: `${product.name} - VIETBAD STORE`,
    description: product.description
  };
}

export default async function Page({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = PRODUCTS.find((item) => item.id === productId);

  if (!product) {
    notFound();
  }

  const relatedProducts = PRODUCTS
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
}
