'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { A11y, Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { useOmnilink } from '../context/OmnilinkContext';
import { ProductItem, ScenePost, Exhibition } from '../types';

export const HomeScreen: React.FC = () => {
  const {
    feedItems,
    exhibitions,
    openExhibition,
    openFloatingProduct,
    openScenePost,
  } = useOmnilink();

  return (
    <div className="min-h-dvh w-full bg-white pb-28 pt-2">
      {/* 顶部策展大卡横滑区 (保留高透磨砂玻璃策展卡片，无冗余文字标题与分类标签) */}
      {exhibitions.length > 0 && <section className="overflow-hidden px-2 pb-2.5 sm:px-2.5">
        <ExhibitionCarousel exhibitions={exhibitions} onSelect={openExhibition} />
      </section>}

      {/* Main Waterfall Feed (缩近卡片间距 gap-1.5, 统一白色底部, 4px边框, 单行商品名, 低调价格) */}
      <section className="px-2 sm:px-2.5">
        {feedItems.length === 0 && <p className="mx-auto max-w-md py-16 text-center text-sm text-[var(--market-text-secondary)]">目前还没有发布的商品。</p>}
        <div className="columns-2 gap-1.5 lg:columns-3 2xl:columns-4">
          {feedItems.map((item, idx) =>
            <div key={`${item.type}-${idx}`} className="mb-1.5 break-inside-avoid">
              {item.type === 'product' ? (
                <FeedProductCard
                  product={item.product}
                  onClick={() => openFloatingProduct(item.product)}
                />
              ) : (
                <FeedSceneCard
                  scenePost={item.scenePost}
                  onClick={() => openScenePost(item.scenePost)}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ExhibitionCarousel: React.FC<{
  exhibitions: Exhibition[];
  onSelect: (exhibition: Exhibition) => void;
}> = ({ exhibitions, onSelect }) => {
  const [reducedMotion, setReducedMotion] = useState(true);
  const canLoop = exhibitions.length > 1;
  const slides = canLoop && exhibitions.length < 4
    ? Array.from({ length: Math.ceil(4 / exhibitions.length) }, () => exhibitions).flat()
    : exhibitions;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="home-exhibition-carousel w-full"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Swiper
          modules={[A11y, Autoplay, Pagination]}
          autoplay={canLoop && !reducedMotion
            ? { delay: 1500, disableOnInteraction: true, pauseOnMouseEnter: true }
            : false}
          grabCursor={canLoop}
          slidesPerView={1}
          centeredSlides={false}
          loop={canLoop}
          pagination={{ clickable: true }}
          className="home-exhibition-swiper"
          aria-label="策展专栏"
        >
          {slides.map((exhibition, index) => (
            <SwiperSlide key={`${exhibition.id}-${index}`}>
              <ExhibitionCard
                exhibition={exhibition}
                onClick={() => onSelect(exhibition)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </motion.div>
  );
};

/**
 * 策展卡片 (Full-bleed Background & Hyper-translucent Frosted Glass Pane)
 */
const ExhibitionCard: React.FC<{
  exhibition: Exhibition;
  onClick: () => void;
}> = ({ exhibition, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`打开策展专栏：${exhibition.title}`}
      className="group relative block h-full w-full cursor-pointer overflow-hidden text-left select-none transition-transform duration-200 active:scale-[0.995] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--market-support)]"
    >
      {/* Full-bleed 100% Background Photo (Never Truncated) */}
      <img
        src={exhibition.coverImage}
        alt={exhibition.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Floating Hyper-Translucent Frosted Glass Pane */}
      <div
        className="absolute bottom-0 inset-x-0 flex flex-col justify-end p-4 sm:p-5"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(35, 34, 29, 0) 0%, rgba(35, 34, 29, 0.168) 28%, rgba(35, 34, 29, 0.816) 100%)',
          backdropFilter: 'blur(0.96px) saturate(110%)',
          WebkitBackdropFilter: 'blur(0.96px) saturate(110%)',
        }}
      >
        <span className="w-fit rounded-xs bg-white/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--market-accent)] shadow-2xs sm:text-[10px]">
          策展专栏
        </span>
        <h3 className="mt-1.5 truncate font-editorial text-base font-bold leading-tight text-[var(--market-surface)] drop-shadow-sm sm:text-lg lg:text-xl">
          {exhibition.title}
        </h3>
        <p className="mt-0.5 truncate text-xs font-medium text-[var(--market-surface)]/90 drop-shadow-2xs sm:text-sm">
          {exhibition.subtitle}
        </p>
      </div>
    </button>
  );
};

const FeedProductCard: React.FC<{
  product: ProductItem;
  onClick: () => void;
}> = ({ product, onClick }) => {
  const images = [product.mainImage, ...product.secondaryImages.filter((image) => image !== product.mainImage)];
  const [imageIndex, setImageIndex] = React.useState(0);
  const isLandscape = product.posterFormat ? product.posterFormat === 'landscape' : product.aspectRatio >= 1.15;

  return (
    <div className="product-feed-card group w-full select-none rounded-[var(--radius-card)] bg-[var(--market-canvas)] p-1 transition-colors duration-200 hover:bg-[var(--market-hover)]">
      <div className="px-2">
        {product.storeSlug ? (
          <Link
            href={`/store/${encodeURIComponent(product.storeSlug)}`}
            className="flex min-h-16 w-full min-w-0 flex-col justify-center gap-0.5 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--market-accent)]"
            aria-label={`进入${product.storeName}的网页`}
            title={product.storeName}
          >
            <span className="text-[11px] font-medium tracking-[0.12em] text-[var(--market-text-muted)]">发布者</span>
            <span className="w-full truncate text-base font-semibold leading-[1.25] text-[var(--market-ink)] hover:underline sm:text-lg">{product.storeName}</span>
          </Link>
        ) : (
          <div className="flex min-h-16 min-w-0 flex-col justify-center gap-0.5 py-2.5" title={product.storeName}>
            <span className="text-[11px] font-medium tracking-[0.12em] text-[var(--market-text-muted)]">发布者</span>
            <span className="w-full truncate text-base font-semibold leading-[1.25] text-[var(--market-ink)] sm:text-lg">{product.storeName}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          aria-label={`查看商品：${product.name}`}
          className={`product-feed-card__image block w-full cursor-pointer overflow-hidden bg-[var(--market-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-accent)] ${isLandscape ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}
        >
          <img
            src={images[imageIndex]}
            alt=""
            className={`product-feed-card__photo h-full w-full object-cover ${product.id === 'P0005' && imageIndex === 0 ? 'product-feed-card__photo--trimmed' : ''}`}
            loading="lazy"
          />
        </button>
        {images.length > 1 ? (
          <LiquidGlass
            role="group"
            aria-label="商品图片"
            radius={999}
            bevelDepth={4}
            scale={16}
            aberration={1}
            frost={4}
            tint={0.12}
            className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5 border border-[var(--market-glass-border)] px-1 py-0.5"
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={`查看第 ${index + 1} 张商品图片`}
                aria-current={index === imageIndex ? 'true' : undefined}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${index === imageIndex ? 'bg-white' : 'bg-white/50'}`} aria-hidden="true" />
              </button>
            ))}
          </LiquidGlass>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClick}
        aria-label={`查看商品：${product.name}`}
        className="product-feed-card__details flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 px-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--market-accent)]"
      >
        <span className="min-w-0 flex-1 truncate text-xs font-normal leading-tight text-[var(--market-text-secondary)] sm:text-sm">{product.name}</span>
        <span className="shrink-0 text-xs font-normal text-[var(--market-text-muted)]">{product.formattedPrice}</span>
      </button>
    </div>
  );
};

const FeedSceneCard: React.FC<{
  scenePost: ScenePost;
  onClick: () => void;
}> = ({ scenePost, onClick }) => {
  const productCount = scenePost.linkedProducts?.length || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`查看${scenePost.kind ? '内容' : '场景'}：${scenePost.title}`}
      className="scene-post-card group relative block w-full cursor-pointer overflow-hidden bg-[var(--market-surface-muted)] text-left shadow-2xs transition-all duration-200 hover:shadow-xs active:scale-[0.98]"
    >
      <img
        src={scenePost.coverImage}
        alt=""
        className="block h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <span className="scene-post-card__glass pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 px-3 pb-3 pt-12 text-white sm:px-4 sm:pb-4">
        <span className="block truncate text-xs font-semibold leading-tight sm:text-sm">
          {scenePost.title}
        </span>
        <span className="flex items-center justify-between gap-2 text-[11px] text-white/90">
          <span className="min-w-0 flex-1 truncate">
            {scenePost.editorName}
          </span>
          {productCount > 0 && (
            <span className="flex shrink-0 items-center gap-1">
              {scenePost.kind ? <Layers size={11} aria-hidden="true" /> : <ShoppingBag size={11} aria-hidden="true" />}
              <span>{productCount}</span>
            </span>
          )}
        </span>
      </span>
    </button>
  );
};
