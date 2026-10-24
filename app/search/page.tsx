import App from '@/components/consumer-market/App';
import { productsList } from '@/components/consumer-market/data/mockData';

export const metadata = {
  title: '搜索 Omnilink 灵感市场',
  description: '搜索空间美学单品、品牌与创作者。',
};

export default function SearchPage() {
  return (
    <App
      initialProducts={productsList}
      initialSearch={true}
      initialTab="WORLD"
    />
  );
}
