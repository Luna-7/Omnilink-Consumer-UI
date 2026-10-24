import React, { useMemo, useState } from 'react';
import { Minus, Plus, Sparkles, Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOmnilink } from '../context/OmnilinkContext';
import { formatConsumerPrice, groupCartByStore, writeStoreCheckoutCart } from '../services/cartHandoff';
import type { CartItem } from '../types';

const getCartItemKey = (item: CartItem) =>
  `${item.product.id}_${item.variantId ?? item.product.defaultVariantId ?? 'base'}`;

export const CartScreen: React.FC = () => {
  const router = useRouter();
  const {
    cartItems,
    updateCartQuantity,
    removeFromCart,
    openProductDetail,
    startCartComparison,
  } = useOmnilink();
  const [excludedKeys, setExcludedKeys] = useState<Set<string>>(() => new Set());

  const selectedItems = useMemo(
    () => cartItems.filter((item) => !excludedKeys.has(getCartItemKey(item))),
    [cartItems, excludedKeys],
  );
  const storeGroups = useMemo(() => groupCartByStore(cartItems), [cartItems]);
  const selectedStoreGroups = useMemo(() => groupCartByStore(selectedItems), [selectedItems]);
  const currencies = new Set(selectedItems.map((item) => item.product.currency || 'CNY'));
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const amountSummary = currencies.size <= 1
    ? formatConsumerPrice(selectedTotal, selectedItems[0]?.product.currency || 'CNY')
    : '按店铺与币种分别核算';

  const toggleItem = (key: string, checked: boolean) => {
    setExcludedKeys((previous) => {
      const next = new Set(previous);
      if (checked) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleStore = (items: CartItem[], checked: boolean) => {
    setExcludedKeys((previous) => {
      const next = new Set(previous);
      items.forEach((item) => {
        const key = getCartItemKey(item);
        if (checked) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  };

  const handleCheckout = (storeSlug: string, items: CartItem[]) => {
    writeStoreCheckoutCart(storeSlug, items);
    router.push(`/store/${storeSlug}/checkout`);
  };

  return (
    <div className="min-h-screen bg-white text-[var(--market-ink)] pb-32 pt-2 select-none">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="font-editorial text-3xl font-bold text-[var(--market-ink)]">
              选品清单
            </h1>
            <p className="text-xs text-[var(--market-text-muted)]">
              共 {cartItems.length} 款商品，已勾选 {selectedItems.length} 款
            </p>
          </div>

          {selectedItems.length >= 2 && (
            <button
              onClick={() => startCartComparison(selectedItems[0].product, selectedItems[1].product)}
              className="flex items-center gap-1.5 rounded-full bg-[var(--market-accent)]/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--market-accent)] hover:bg-[var(--market-accent)]/20 active:scale-95 transition-all shadow-xs border border-[var(--market-accent)]/20"
            >
              <Sparkles size={13} />
              <span>AI 智能对比</span>
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-[var(--market-text-muted)]">
            <ShoppingBag size={40} strokeWidth={1.5} className="text-[var(--market-text-muted)]/40" />
            <h3 className="mt-4 font-editorial text-2xl text-[var(--market-ink)]">
              您的选品袋当前为空
            </h3>
            <p className="mt-1 text-xs text-[var(--market-text-muted)] max-w-xs">
              欢迎前往首页瀑布流或 AI 空间工坊发现心仪美学单品。
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {storeGroups.map((group) => {
              const groupKeys = group.items.map(getCartItemKey);
              const checkedCount = groupKeys.filter((key) => !excludedKeys.has(key)).length;
              const allChecked = checkedCount === group.items.length;
              const someChecked = checkedCount > 0 && !allChecked;

              return (
                <section key={group.storeSlug} aria-labelledby={`cart-store-${group.storeSlug}`}>
                  <div className="mb-2 flex items-center gap-2 border-b border-[var(--market-border)]/70 px-1 pb-2">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(element) => {
                        if (element) element.indeterminate = someChecked;
                      }}
                      onChange={(event) => toggleStore(group.items, event.target.checked)}
                      aria-label={`全选${group.storeName}商品`}
                      className="h-4 w-4 accent-[var(--market-pine)]"
                    />
                    <h2 id={`cart-store-${group.storeSlug}`} className="text-sm font-semibold text-[var(--market-ink)]">
                      {group.storeName}
                    </h2>
                    <span className="text-xs text-[var(--market-text-muted)]">{group.items.length} 款</span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => {
                      const itemKey = getCartItemKey(item);
                      const checked = !excludedKeys.has(itemKey);
                      const variantId = item.variantId ?? item.product.defaultVariantId ?? null;
                      return (
                        <div
                          key={itemKey}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-xs transition-colors ${checked ? 'border-[var(--market-border)]/70 bg-[var(--market-surface)]' : 'border-[var(--market-border)]/50 bg-[var(--market-surface-muted)]/45'}`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => toggleItem(itemKey, event.target.checked)}
                              aria-label={`选择${item.product.name}`}
                              className="h-4 w-4 shrink-0 accent-[var(--market-pine)]"
                            />
                            <button
                              type="button"
                              onClick={() => openProductDetail(item.product)}
                              className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                            >
                              <img
                                src={item.product.mainImage}
                                alt={item.product.name}
                                className="h-16 w-16 shrink-0 rounded-lg bg-[var(--market-surface-muted)] object-cover"
                              />
                              <span className="min-w-0 pr-1">
                                <span className="block truncate text-sm font-bold text-[var(--market-ink)]">
                                  {item.product.name}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-[var(--market-text-muted)]">
                                  款式规格：{item.variant}
                                </span>
                                <span className="block text-xs font-bold text-[var(--market-ink)]">
                                  {item.product.formattedPrice}
                                </span>
                              </span>
                            </button>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <div className="flex items-center rounded-full border border-[var(--market-border)]/60 bg-[var(--market-surface-muted)] p-1">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, -1, variantId)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[var(--market-ink)] shadow-xs transition-all hover:bg-[var(--market-surface-muted)] active:scale-90"
                                aria-label={`减少${item.product.name}数量`}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-[var(--market-ink)]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, 1, variantId)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[var(--market-ink)] shadow-xs transition-all hover:bg-[var(--market-surface-muted)] active:scale-90"
                                aria-label={`增加${item.product.name}数量`}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id, variantId)}
                              className="p-1.5 text-[var(--market-text-muted)]/60 transition-colors hover:text-[var(--market-accent)]"
                              title="移除单品"
                              aria-label={`移除${item.product.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {selectedItems.length > 0 ? (
              <div className="mt-6 rounded-xl border border-[var(--market-border)]/60 bg-[var(--market-surface)] p-5 shadow-xs">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--market-text-muted)]">
                    <span>已选商品金额</span>
                    <span className="font-bold text-[var(--market-ink)]">{amountSummary}</span>
                  </div>
                  <div className="flex justify-between text-[var(--market-text-muted)]">
                    <span>运费与库存</span>
                    <span>提交询价后由商家确认</span>
                  </div>
                  {selectedStoreGroups.map((group) => {
                    const total = group.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                    const currency = group.items[0]?.product.currency || 'CNY';
                    return (
                      <div key={group.storeSlug} className="flex justify-between border-t border-[var(--market-border)]/60 pt-2 text-[var(--market-text-muted)]">
                        <span>{group.storeName}小计</span>
                        <span className="font-semibold text-[var(--market-ink)]">{formatConsumerPrice(total, currency)}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-baseline justify-between border-t border-[var(--market-border)] pt-3">
                    <span className="font-editorial text-lg font-bold text-[var(--market-ink)]">商品金额小计</span>
                    <span className="font-editorial text-2xl font-bold text-[var(--market-ink)]">{amountSummary}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {selectedStoreGroups.map(({ storeSlug, storeName, items }) => {
                    const count = items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <button
                        key={storeSlug}
                        onClick={() => handleCheckout(storeSlug, items)}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--market-accent)] px-3 text-xs font-bold text-[var(--market-surface)] transition-colors hover:bg-[var(--market-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-accent)]"
                      >
                        {selectedStoreGroups.length > 1 ? `向 ${storeName} 提交询价（${count} 件）` : `前往询价（${count} 件）`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-[var(--market-surface-muted)] px-4 py-3 text-center text-xs text-[var(--market-text-muted)]">
                勾选商品后显示金额并可提交询价
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
