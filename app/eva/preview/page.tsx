import App from '@/components/consumer-market/App';
import { productsList } from '@/components/consumer-market/data/mockData';

export const metadata = {
  title: 'EVA 智能顾问引导预览 Omnilink 灵感市场',
  description: '与 EVA AI 对话，预览生活美学问答建档与顾问流程。',
};

export default function EvaPreviewPage() {
  return (
    <App
      initialProducts={productsList}
      initialTab="PERSONAL"
      initialWelcome={true}
      evaPreview={true}
    />
  );
}
