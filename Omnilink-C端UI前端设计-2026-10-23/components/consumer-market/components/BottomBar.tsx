import React from 'react';
import PillNav from './PillNav';
import { useOmnilink } from '../context/OmnilinkContext';

const navItems = [
  { label: '发现', href: '/discover' },
  { label: '搜索', href: '/discover/search' },
  { label: '个人', href: '/discover/profile' },
];

export const BottomBar: React.FC = () => {
  const { mainTab, selectTab, isSearchOpen, setSearchOpen, setProfileTab, openAiPage } = useOmnilink();
  const activeHref = isSearchOpen ? '/discover/search' : mainTab === 'PROFILE' ? '/discover/profile' : mainTab === 'PERSONAL' ? '/discover/eva' : '/discover';

  const navigate = (href: string) => {
    if (href === '/discover/search') setSearchOpen(true);
    else if (href === '/discover/eva') openAiPage();
    else if (href === '/discover/profile') { setProfileTab('SAVED'); selectTab('PROFILE'); }
    else selectTab('WORLD');
  };

  return <div className="pointer-events-none fixed inset-x-0 z-30 px-3" style={{ bottom: 'max(14px, env(safe-area-inset-bottom, 0px))' }}>
    <PillNav
      logoAlt="EVA"
      items={navItems}
      activeHref={activeHref}
      onItemClick={navigate}
      intro
    />
  </div>;
};
