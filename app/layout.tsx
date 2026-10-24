import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Omnilink 灵感市场',
  description: '浏览创作者发布的内容、商品与推荐，智能导购与灵感发现。',
  openGraph: {
    title: 'Omnilink 灵感市场',
    description: '浏览创作者发布的内容、商品与推荐，智能导购与灵感发现。',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-dvh bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}
