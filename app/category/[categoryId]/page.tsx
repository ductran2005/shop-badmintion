import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES, PRODUCTS } from '../../data';
import CategoryProductsPage from './CategoryProductsPage';

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

const visibleCategories = CATEGORIES.filter((category) => category.id !== 'all');

export function generateStaticParams() {
  return visibleCategories.map((category) => ({
    categoryId: category.id
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = visibleCategories.find((item) => item.id === categoryId);

  if (!category) {
    return {
      title: 'Danh mục sản phẩm - VIETBAD STORE'
    };
  }

  return {
    title: `${category.name} - VIETBAD STORE`,
    description: `Mua ${category.name.toLowerCase()} chính hãng tại VIETBAD STORE.`
  };
}

export default async function Page({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const category = visibleCategories.find((item) => item.id === categoryId);

  if (!category) {
    notFound();
  }

  const products = PRODUCTS.filter((product) => product.category === category.id);

  return (
    <CategoryProductsPage
      category={category}
      products={products}
      allProducts={PRODUCTS}
      categories={visibleCategories}
    />
  );
}
