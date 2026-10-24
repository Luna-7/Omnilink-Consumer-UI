import App from '@/components/consumer-market/App';
import { productsList } from '@/components/consumer-market/data/mockData';

export const metadata = {
  title: '个人中心 Omnilink 灵感市场',
  description: '我的收藏、关注店铺、形象偏好与 EVA 记忆。',
};

export default function ProfilePage() {
  return (
    <App
      initialProducts={productsList}
      initialTab="PROFILE"
      profileName="体验访客"
      publisherReady={false}
      profilePreview={true}
    />
  );
}
