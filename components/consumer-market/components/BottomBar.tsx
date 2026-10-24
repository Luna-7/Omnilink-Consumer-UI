import React from 'react';
import { useRouter } from 'next/navigation';
import PillNav, { type NavItem } from './PillNav';
import { useOmnilink } from '../context/OmnilinkContext';

export const BottomBar: React.FC = () => {
  const router = useRouter();
  const {
    mainTab,
    selectTab,
    isSearchOpen,
    setSearchOpen,
    setProfileTab,
    openAiPage,
    cartItems,
  } = useOmnilink();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const activeHref = isSearchOpen
    ? '/search'
    : mainTab === 'CART'
    ? '/cart'
    : mainTab === 'PROFILE'
    ? '/profile'
    : mainTab === 'PERSONAL'
    ? '/eva'
    : '/';

  const navItems: NavItem[] = [
    { label: '发现', href: '/' },
    { label: '搜索', href: '/search' },
    { label: '选品袋', href: '/cart', badge: cartCount },
    { label: '个人', href: '/profile' },
  ];

  const navigate = (href: string) => {
    if (href === '/search' || href === '/discover/search') {
      setSearchOpen(true);
      try { router.push('/search'); } catch {}
    } else if (href === '/eva' || href === '/discover/eva') {
      openAiPage();
      try { router.push('/eva'); } catch {}
    } else if (href === '/cart' || href === '/discover/cart') {
      selectTab('CART');
      try { router.push('/cart'); } catch {}
    } else if (href === '/profile' || href === '/discover/profile') {
      setProfileTab('SAVED');
      selectTab('PROFILE');
      try { router.push('/profile'); } catch {}
    } else {
      selectTab('WORLD');
      try { router.push('/'); } catch {}
    }
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 px-3"
      style={{ bottom: 'max(14px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="pointer-events-auto">
        <PillNav
          logoAlt="EVA 智能形象顾问"
          items={navItems}
          activeHref={activeHref}
          onItemClick={navigate}
          intro
        />
      </div>
    </div>
  );
};
