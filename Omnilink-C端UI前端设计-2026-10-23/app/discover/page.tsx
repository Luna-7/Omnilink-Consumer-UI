import App from '@/components/consumer-market/App'
import { productsList } from '@/components/consumer-market/data/mockData'
import type { ProductItem, ScenePost } from '@/components/consumer-market/types'
import { getStorefrontDiscoveryItems } from '@/lib/storefront/service'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { readEvaProfile } from '@/lib/consumer-advisor/eva-onboarding'
import { readContentBlocks } from '@/lib/creator-content'

export const metadata = {
  title: 'Omnilink 灵感市场',
  description: '浏览创作者发布的内容、商品与推荐。',
}

function toConsumerProduct(
  item: Awaited<ReturnType<typeof getStorefrontDiscoveryItems>>[number]
): ProductItem {
  const { product, store } = item
  const image = product.imageUrl || '/consumer-market/img_app_icon.jpg'
  const currency = product.currency || 'CNY'
  let formattedPrice = `${currency} ${product.price.toLocaleString('zh-CN')}`
  try {
    formattedPrice = new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(product.price)
  } catch {
    // Keep the explicit currency fallback for non-ISO currency values.
  }

  return {
    id: product.id,
    name: product.name,
    creator: store.name,
    price: product.price,
    formattedPrice: product.priceMode === 'inquiry' ? '询价' : product.priceMode === 'free' || product.price === 0 ? '免费' : formattedPrice,
    priceMode: product.priceMode,
    outboundLinks: product.outboundLinks,
    mainImage: image,
    aspectRatio: 0.82,
    secondaryImages: (product.images ?? []).filter((url) => url !== image),
    category: product.attributes.category || product.attributes.category_name || '精选商品',
    shortDescription: product.description || '',
    aiSummary: product.description || '商品信息由创作者维护。',
    reviews: [],
    specs: product.attributes,
    storeName: store.name,
    storeImage: undefined,
    contextStory: product.description || undefined,
    currency,
    defaultVariantId: product.variants?.find((variant) => variant.status === 'active')?.id ?? product.variants?.[0]?.id ?? null,
    options: product.options,
    variants: product.variants,
    deliveryType: product.attributes.delivery_type === 'ai_capability' ? 'ai_capability' : 'physical',
    capabilityKind: product.attributes.capability_kind === 'question_set' || product.attributes.capability_kind === 'skill' || product.attributes.capability_kind === 'plugin'
      ? product.attributes.capability_kind
      : undefined,
  }
}

export default async function ConsumerMarketPage({ searchParams }: { searchParams: Promise<{ evaPreview?: string; openEva?: string; demoLogin?: string; post?: string }> }) {
  const params = await searchParams
  const evaPreview = process.env.NODE_ENV !== 'production' && params.evaPreview === '1'
  const demoLogin = process.env.NODE_ENV !== 'production' && params.demoLogin === '1'
  if (demoLogin || evaPreview) {
    return <App initialProducts={productsList} profileName={demoLogin ? '预览用户' : null} initialWelcome={evaPreview} evaPreview={evaPreview} profilePreview={demoLogin} />
  }
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  const publisherReady = user ? Boolean(await getStoreByOwnerId(user.id)) : false
  let initialProducts: ProductItem[] = productsList
  let initialPosts: ScenePost[] = []

  try {
    const liveItems = await getStorefrontDiscoveryItems(100)
    const publishedProducts = liveItems.map(toConsumerProduct)
    if (liveItems.length) {
      const publishedIds = new Set(publishedProducts.map((product) => product.id))
      initialProducts = [...publishedProducts, ...productsList.filter((product) => !publishedIds.has(product.id))]
    }
    const { data: posts, error: postsError } = await supabase.from('creator_posts')
      .select('id, store_id, title, cover_url, body, product_ids, blocks')
      .eq('status', 'published').order('published_at', { ascending: false }).limit(30)
    if (postsError) throw postsError
    const storeIds = [...new Set((posts ?? []).map((post) => post.store_id))]
    const { data: stores } = storeIds.length
      ? await supabase.from('stores').select('id, name').in('id', storeIds)
      : { data: [] }
    const storeNames = new Map((stores ?? []).map((store) => [store.id, store.name]))
    const productById = new Map(publishedProducts.map((product) => [product.id, product]))
    initialPosts = (posts ?? []).flatMap((post) => {
      const productIds = Array.isArray(post.product_ids) ? post.product_ids as string[] : []
      const linkedProducts = productIds.map((id) => productById.get(id)).filter((item): item is ProductItem => Boolean(item))
      if (!linkedProducts.length || linkedProducts.length !== productIds.length) return []
      return [{
        id: post.id, kind: 'note' as const,
        title: post.title, editorName: storeNames.get(post.store_id) || '创作者', editorAvatar: '/consumer-market/img_app_icon.jpg',
        coverImage: post.cover_url, isVideo: false, mediaList: [post.cover_url], linkedProducts,
        aspectRatio: 0.8, description: post.body,
        blocks: readContentBlocks(post.blocks, post.body, productIds),
      }]
    })
  } catch (error) {
    console.warn('[ConsumerMarket] Published content unavailable.', error)
  }

  const needsWelcome = user?.user_metadata?.eva_onboarding_started === true && user.user_metadata?.eva_onboarding_complete !== true
  const evaProfile = readEvaProfile(user?.user_metadata?.eva_profile)
  return <App initialProducts={initialProducts} initialPosts={initialPosts} hasLiveProducts profileName={evaProfile.name || user?.email || null} publisherReady={publisherReady} initialWelcome={needsWelcome} initialEvaChat={params.openEva === '1'} initialEvaProfile={evaProfile} initialPostId={params.post} />
}
