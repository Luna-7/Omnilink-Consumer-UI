import App from '@/components/consumer-market/App';
import { productsList } from '@/components/consumer-market/data/mockData';

export const metadata = {
  title: '选品清单 Omnilink 灵感市场',
  description: '查看已选择的心仪设计单品与商品比选。',
};

export default function CartPage() {
  return (
    <App
      initialProducts={productsList}
      initialTab="CART"
    />
  );
}
