import type { CartItem } from '../types'

export function groupCartByStore(items: CartItem[]) {
  const groups = new Map<string, { storeSlug: string; storeName: string; items: CartItem[] }>()
  for (const item of items) {
    const storeSlug = item.product.storeSlug || 'omnilink-flagship'
    const group = groups.get(storeSlug) ?? {
      storeSlug,
      storeName: item.product.storeName || storeSlug,
      items: [],
    }
    group.items.push(item)
    groups.set(storeSlug, group)
  }
  return [...groups.values()]
}

export function formatConsumerPrice(amount: number, currency = 'CNY') {
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('zh-CN')}`
  }
}

export function writeStoreCheckoutCart(storeSlug: string, items: CartItem[]) {
  const itemsForStore = items
    .filter((item) => (item.product.storeSlug || 'omnilink-flagship') === storeSlug)
    .map((item) => ({
      id: `${item.product.id}_${item.variantId ?? item.product.defaultVariantId ?? 'base'}_`,
      productId: item.product.id,
      variantId: item.variantId ?? item.product.defaultVariantId ?? null,
      quantity: item.quantity,
      productName: item.product.name,
      image: item.product.mainImage,
      price: item.product.price,
      currency: item.product.currency || 'CNY',
      selectedOptions: item.selectedOptions ?? {},
    }))

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    localStorage.setItem(`omnilink_cart_${storeSlug}`, JSON.stringify(itemsForStore));
  }
  return itemsForStore.length;
}
