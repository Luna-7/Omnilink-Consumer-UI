/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OmnilinkProvider, useOmnilink } from './context/OmnilinkContext';
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { FloatingCard } from './components/FloatingCard';
import { AiCartComparisonDialog } from './components/AiCartComparisonDialog';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { PersonalStudioScreen } from './screens/PersonalStudioScreen';
import { CartScreen } from './screens/CartScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { SceneViewerScreen } from './screens/SceneViewerScreen';
import { ExhibitionDetailScreen } from './screens/ExhibitionDetailScreen';
import { ReviewsScreen } from './screens/ReviewsScreen';
import { SearchScreen } from './screens/SearchScreen';
import { StoreScreen } from './screens/StoreScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { EvaWelcomeFlow } from './screens/EvaWelcomeFlow';
import type { ProductItem, ScenePost } from './types';
import { CreatorPostReader } from './screens/CreatorPostReader';
import type { EvaProfile } from '@/lib/consumer-advisor/eva-onboarding';

const OmnilinkAppInner: React.FC<{ profileName: string | null; publisherReady: boolean; initialWelcome: boolean; initialEvaProfile?: EvaProfile; initialPostId?: string; evaPreview?: boolean; profilePreview?: boolean }> = ({ profileName, publisherReady, initialWelcome, initialEvaProfile, initialPostId, evaPreview, profilePreview }) => {
  const [previewStoreName, setPreviewStoreName] = useState<string | null>(null);
  const {
    mainTab,
    selectedFloatingProduct,
    closeFloatingProduct,
    openProductDetail,
    currentProductDetail,
    closeProductDetail,
    currentScenePost,
    currentSceneIndex,
    scenePosts,
    openScenePost,
    closeScenePost,
    currentExhibition,
    closeExhibition,
    isSearchOpen,
    setSearchOpen,
    searchQuery,
    searchResults,
    updateSearchQuery,
    isReviewsOpen,
    closeReviews,
    cartComparisonPair,
    closeCartComparison,
    openReviews,
    toastMessage,
  } = useOmnilink();

  const openedPost = useRef(false);
  useEffect(() => {
    if (!initialPostId || openedPost.current) return;
    const post = scenePosts.find((item) => item.id === initialPostId);
    if (post) { openScenePost(post); openedPost.current = true; }
  }, [initialPostId, openScenePost, scenePosts]);

  const reviewTarget = currentProductDetail || null;
  const openProductStore = (product: ProductItem) => {
    setPreviewStoreName(product.storeName);
  };

  return (
    <div className="min-h-dvh w-full bg-[var(--market-canvas)] text-[var(--market-ink)] antialiased flex flex-col selection:bg-[var(--market-accent)]/15">
      <div className="flex min-h-dvh w-full flex-1 flex-col bg-[var(--market-canvas)]">
        {/* Main App Header (Shown on World, Profile & Cart tabs) */}
        {(mainTab === 'WORLD' || mainTab === 'PROFILE' || mainTab === 'CART') && <Header />}

        {/* Primary Tab View */}
        <main key={mainTab} className="market-screen-enter flex-1 w-full">
          {mainTab === 'WORLD' && <HomeScreen />}
          {mainTab === 'PERSONAL' && (initialWelcome ? <EvaWelcomeFlow initialProfile={initialEvaProfile} preview={evaPreview} /> : <PersonalStudioScreen />)}
          {mainTab === 'CART' && <CartScreen />}
          {mainTab === 'PROFILE' && <ProfileScreen profileName={profileName} publisherReady={publisherReady} preview={profilePreview} />}
        </main>

        {/* Bottom Navigation Bar */}
        {mainTab !== 'PERSONAL' && <BottomBar />}
      </div>

      {/* Overlay: Floating Product Card (Bottom Sheet over Feed) */}
      {selectedFloatingProduct && (
        <FloatingCard
          key={selectedFloatingProduct.id}
          product={selectedFloatingProduct}
          onDismiss={closeFloatingProduct}
          onExpandDetail={openProductDetail}
          onOpenStore={openProductStore}
        />
      )}

      {/* Overlay: Full Product Detail Space */}
      {currentProductDetail && (
        <ProductDetailScreen
          key={currentProductDetail.id}
          product={currentProductDetail}
          onClose={closeProductDetail}
          onOpenStore={openProductStore}
          onOpenReviews={openReviews}
        />
      )}

      {previewStoreName && (
        <StoreScreen
          storeName={previewStoreName}
          onClose={() => setPreviewStoreName(null)}
          onProductClick={(product) => {
            setPreviewStoreName(null);
            openProductDetail(product);
          }}
        />
      )}

      {/* Overlay: Full Screen Short Video / Scene Viewer */}
      {currentScenePost?.kind ? (
        <CreatorPostReader post={currentScenePost} onClose={closeScenePost} onOpenProduct={(product) => { closeScenePost(); openProductDetail(product); }} />
      ) : currentScenePost && (
        <SceneViewerScreen
          scenePosts={scenePosts}
          initialIndex={currentSceneIndex}
          onClose={closeScenePost}
          onOpenProductDetail={openProductDetail}
        />
      )}

      {/* Overlay: Digital Magazine Exhibition Detail */}
      {currentExhibition && (
        <ExhibitionDetailScreen
          exhibition={currentExhibition}
          onClose={closeExhibition}
          onProductClick={openProductDetail}
        />
      )}

      {/* Overlay: Search Space */}
      {isSearchOpen && (
        <SearchScreen
          query={searchQuery}
          results={searchResults}
          onQueryChange={updateSearchQuery}
          onClose={() => setSearchOpen(false)}
          onProductClick={(p) => {
            setSearchOpen(false);
            openProductDetail(p);
          }}
        />
      )}

      {/* Overlay: Aggregated Theme Reviews Screen */}
      {isReviewsOpen && reviewTarget && (
        <ReviewsScreen
          reviews={reviewTarget.reviews}
          onClose={closeReviews}
        />
      )}

      {/* Overlay: AI Cart Comparison Dialog */}
      {cartComparisonPair && (
        <AiCartComparisonDialog
          pair={cartComparisonPair}
          onClose={closeCartComparison}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--market-ink)] px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function App({
  initialProducts = [],
  initialPosts = [],
  hasLiveProducts = false,
  profileName = null,
  publisherReady = false,
  initialWelcome = false,
  initialEvaChat = false,
  initialEvaProfile,
  initialPostId,
  evaPreview = false,
  profilePreview = false,
  initialTab,
  initialSearch = false,
}: {
  initialProducts?: ProductItem[];
  initialPosts?: ScenePost[];
  hasLiveProducts?: boolean;
  profileName?: string | null;
  publisherReady?: boolean;
  initialWelcome?: boolean;
  initialEvaChat?: boolean;
  initialEvaProfile?: EvaProfile;
  initialPostId?: string;
  evaPreview?: boolean;
  profilePreview?: boolean;
  initialTab?: import('./types').MainTab;
  initialSearch?: boolean;
}) {
  return (
    <div className="consumer-market-shell">
      <OmnilinkProvider
        initialProducts={initialProducts}
        initialPosts={initialPosts}
        hasLiveProducts={hasLiveProducts}
        initialWelcome={initialWelcome || initialEvaChat}
        initialTab={initialTab ?? 'PERSONAL'}
        initialSearch={initialSearch}
      >
        <OmnilinkAppInner
          profileName={profileName}
          publisherReady={publisherReady}
          initialWelcome={initialWelcome}
          initialEvaProfile={initialEvaProfile}
          initialPostId={initialPostId}
          evaPreview={evaPreview}
          profilePreview={profilePreview}
        />
      </OmnilinkProvider>
    </div>
  );
}
