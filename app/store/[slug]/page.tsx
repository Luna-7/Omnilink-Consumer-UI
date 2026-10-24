import { productsList } from '@/components/consumer-market/data/mockData';
import StoreClientPage from './StoreClientPage';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const matched = productsList.find(
    (p) => p.storeSlug?.toLowerCase() === decoded.toLowerCase() || p.storeName.toLowerCase() === decoded.toLowerCase()
  );
  const storeName = matched?.storeName || decoded;

  return {
    title: `${storeName} 店铺主页 Omnilink 灵感市场`,
    description: `浏览 ${storeName} 发布的精选设计单品、空间美学与推荐。`,
  };
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const matched = productsList.find(
    (p) => p.storeSlug?.toLowerCase() === decoded.toLowerCase() || p.storeName.toLowerCase() === decoded.toLowerCase()
  );
  const storeName = matched?.storeName || decoded;

  return <StoreClientPage storeName={storeName} />;
}
