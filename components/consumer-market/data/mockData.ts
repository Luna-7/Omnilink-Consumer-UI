import {
  ProductItem,
  Review,
  Exhibition,
  Creator,
  Story,
  ScenePost,
  FeedItem,
} from '../types';
import collectedProductData from './collected-demo-products.json';

const demoProducts = collectedProductData as unknown as ProductItem[];
const cleanedProductImages: Record<string, string> = {
  P0010: '/consumer-market/cleaned/collected-p0010-clean.webp',
  P0011: '/consumer-market/cleaned/collected-p0011-clean.webp',
  P0016: '/consumer-market/cleaned/collected-p0016-clean.webp',
  P0006: '/consumer-market/cleaned/collected-p0006-clean.webp',
  P0007: '/consumer-market/cleaned/collected-p0007-clean.webp',
  P0008: '/consumer-market/cleaned/collected-p0008-clean.webp',
  P0028: '/consumer-market/cleaned/collected-p0028-clean.webp',
  P0031: '/consumer-market/cleaned/collected-p0031-clean.webp',
  P0032: '/consumer-market/cleaned/collected-p0032-clean.webp',
  P0034: '/consumer-market/cleaned/collected-p0034-clean.webp',
  P0036: '/consumer-market/cleaned/collected-p0036-clean.webp',
  P0038: '/consumer-market/cleaned/collected-p0038-clean.webp',
  P0040: '/consumer-market/cleaned/collected-p0040-clean.webp',
  P0041: '/consumer-market/cleaned/collected-p0041-clean.webp',
  P0043: '/consumer-market/cleaned/collected-p0043-clean.webp',
  P0044: '/consumer-market/cleaned/collected-p0044-clean.webp',
  P0045: '/consumer-market/cleaned/collected-p0045-clean.webp',
  P0046: '/consumer-market/cleaned/collected-p0046-clean.webp',
  P0047: '/consumer-market/cleaned/collected-p0047-clean.webp',
  P0051: '/consumer-market/cleaned/collected-p0051-clean.webp',
  P0052: '/consumer-market/cleaned/collected-p0052-clean.webp',
  P0053: '/consumer-market/cleaned/collected-p0053-clean.webp',
  P0054: '/consumer-market/cleaned/collected-p0054-clean.webp',
  P0056: '/consumer-market/cleaned/collected-p0056-clean.webp',
  P0059: '/consumer-market/cleaned/collected-p0059-clean.webp',
};
export const collectedDemoProducts = demoProducts
  .map((product) => ({
    ...product,
    mainImage: cleanedProductImages[product.id] ?? product.mainImage,
  }));

export const sampleReviews: Review[] = [
  {
    id: 'r1',
    author: 'Elena Vance',
    rating: 5.0,
    text: '黄铜做旧光泽与漫射暖光为我的阅读角落营造了极其静谧亲密的空间氛围。',
    categoryTag: '品质工艺',
    createdAt: '2天前',
  },
  {
    id: 'r2',
    author: 'Julian K.',
    rating: 4.8,
    text: '实心混凝土底座非常沉稳扎实，与描述完全一致，触感温润高级。',
    categoryTag: '品质工艺',
    createdAt: '1周前',
  },
  {
    id: 'r3',
    author: 'Marcus B.',
    rating: 4.5,
    text: '尺寸比预想略大一些，但在小桌面上柔和的光线色温完全弥补了这一点。',
    categoryTag: '空间尺寸',
    createdAt: '2周前',
  },
  {
    id: 'r4',
    author: 'Sofia N.',
    rating: 5.0,
    text: '建筑雕塑般的完美形体。采用无塑料的亚麻再生包装，环保精致。',
    categoryTag: '包装物流',
    createdAt: '3周前',
  },
  {
    id: 'r5',
    author: 'David R.',
    rating: 4.9,
    text: '做工如同博物馆馆藏品，触感沉重且细节雕琢到位。',
    categoryTag: '耐用质感',
    createdAt: '1个月前',
  },
  {
    id: 'r6',
    author: 'Chen L.',
    rating: 5.0,
    text: '复古机械轴体段落感极佳，双金属旋钮让音频和音量调节极具仪式感。',
    categoryTag: '使用舒适',
    createdAt: '3天前',
  },
  {
    id: 'r7',
    author: 'Hannah M.',
    rating: 4.9,
    text: '铝合金模块化桌面整理架将我杂乱的线缆和工具收纳得井井有条。',
    categoryTag: '品质工艺',
    createdAt: '5天前',
  },
];

export const lampProduct: ProductItem = {
  id: 'p_lamp_01',
  name: '包豪斯弧形台灯',
  creator: 'Atelier NORD',
  price: 280.0,
  formattedPrice: '¥280',
  mainImage: '/consumer-market/img_product_lamp.jpg',
  aspectRatio: 1.25,
  secondaryImages: [
    '/consumer-market/img_product_lamp.jpg',
    '/consumer-market/img_creator_alex.jpg',
  ],
  category: '灯光照明',
  shortDescription: '由旋压黄铜与实心混凝土铸造的建筑感桌面台灯。',
  aiSummary:
    '极简极简形体，实心稳重结构，2700K 漫射暖光，适合工作台与书房氛围营造。',
  reviews: sampleReviews,
  specs: {
    材质: '拉丝黄铜 & 浇筑混凝土底座',
    尺寸: '高 46cm × 宽 24cm × 深 18cm',
    光源: '2700K 暖光集成 LED (无级调光)',
    产地: '丹麦 哥本哈根',
  },
  storeName: 'Atelier NORD',
  storeDescription:
    '哥本哈根设计工作室，探索光影、形体与建筑宁静感。',
  storeImage: '/consumer-market/img_creator_alex.jpg',
  contextStory:
    '旨在唤起清晨第一缕阳光洒在工作室桌面上的柔和渐变。',
};

export const chairProduct: ProductItem = {
  id: 'p_chair_02',
  name: '中世纪低矮休闲扶手椅',
  creator: 'Studio K',
  price: 1450.0,
  formattedPrice: '¥1,450',
  mainImage: '/consumer-market/img_product_chair.jpg',
  aspectRatio: 0.85,
  secondaryImages: [
    '/consumer-market/img_product_chair.jpg',
    '/consumer-market/img_exhibition_apartment.jpg',
  ],
  category: '家具',
  shortDescription:
    '采用重磅燕麦色亚麻混纺面料包裹的低矮休闲扶手椅。',
  aiSummary:
    '符合人体工学的低矮坐姿，触感温和的天然亚麻质地，经久不衰的经典建筑感。',
  reviews: sampleReviews,
  specs: {
    框架: '粉末喷涂哑光管状钢架',
    面料: '85% 比利时亚麻, 15% 初剪羊毛',
    尺寸: '宽 78cm × 深 82cm × 高 72cm',
    座高: '38cm',
  },
  storeName: 'Studio K',
  storeDescription:
    '柏林设计团队，专注于减法式极简家具构造。',
  storeImage: '/consumer-market/img_product_chair.jpg',
  contextStory:
    '专为高挑起居空间设计，低矮的坐姿能自然重塑人们对空间的透视感受。',
};

export const vesselProduct: ProductItem = {
  id: 'p_vessel_03',
  name: '侘寂粗陶花器',
  creator: 'Maya S. Studio',
  price: 165.0,
  formattedPrice: '¥165',
  mainImage: '/consumer-market/img_creator_alex.jpg',
  aspectRatio: 1.0,
  secondaryImages: [
    '/consumer-market/img_creator_alex.jpg',
    '/consumer-market/img_product_lamp.jpg',
  ],
  category: '器物艺术',
  shortDescription:
    '手工拉胚成型，表面保留天然无釉哑光肌理。',
  aiSummary:
    '微妙的有机不对称形体，未经施釉的粗陶质地，每件均刻有独立手作编号。',
  reviews: sampleReviews,
  specs: {
    泥料: '天然含铁粗陶土',
    表面工艺: '天然素烧无釉外壁, 防水内壁',
    高度: '28cm',
  },
  storeName: 'Maya S. Studio',
  storeDescription:
    '京都研修陶艺家，创作兼具实用与雕塑感的空间器物。',
  storeImage: '/consumer-market/img_creator_alex.jpg',
  contextStory:
    '探索未经人工修饰的泥土本真之美与慢速柴烧周期的自然窑变。',
};

export const shelfProduct: ProductItem = {
  id: 'p_shelf_04',
  name: '极简隐形实木壁架',
  creator: 'Atelier NORD',
  price: 210.0,
  formattedPrice: '¥210',
  mainImage: '/consumer-market/img_exhibition_apartment.jpg',
  aspectRatio: 1.4,
  secondaryImages: ['/consumer-market/img_exhibition_apartment.jpg'],
  category: '收纳整理',
  shortDescription:
    '精密加工的北美黑胡桃实木置物架，配隐藏式高强钢挂载结构。',
  aiSummary:
    '无痕空间悬挂，木蜡油涂装北美黑胡桃木，极简墙面置物载体。',
  reviews: sampleReviews,
  specs: {
    木材: '北美特级黑胡桃实木',
    承重: '最大承重 25kg',
    尺寸: '长 90cm × 深 22cm × 厚 4cm',
  },
  storeName: 'Atelier NORD',
  storeDescription:
    '哥本哈根设计工作室，探索光影、形体与建筑宁静感。',
  storeImage: '/consumer-market/img_creator_alex.jpg',
  contextStory:
    '让器物如同轻盈悬浮于起居室墙面，消除一切冗杂视觉支架。',
};

export const clockProduct: ProductItem = {
  id: 'p_clock_05',
  name: '建筑感铝合金桌面时钟',
  creator: 'Studio K',
  price: 190.0,
  formattedPrice: '¥190',
  mainImage: '/consumer-market/img_app_icon.jpg',
  aspectRatio: 1.0,
  secondaryImages: ['/consumer-market/img_app_icon.jpg'],
  category: '空间器物',
  shortDescription:
    '整块航空铝合金喷砂一体成型，搭载静音连续扫秒机芯。',
  aiSummary:
    '静音平滑走时，阳极氧化铝实心本体，无刻度极简表盘。',
  reviews: sampleReviews,
  specs: {
    材质: '阳极氧化航空级铝合金',
    机芯: '日本进口静音连续扫秒机芯',
    尺寸: '12cm × 12cm × 4cm',
  },
  storeName: 'Studio K',
  storeDescription:
    '柏林设计团队，专注于减法式极简家具构造。',
  storeImage: '/consumer-market/img_product_chair.jpg',
  contextStory:
    '远离数字屏幕打扰的实体计时器，带来沉浸冥想般的专注陪伴。',
  hasWhiteBg: true,
};

export const headphonesProduct: ProductItem = {
  id: 'p_headphones_06',
  name: '方圆极简无线降噪头戴耳机',
  creator: 'Acoustic Atelier',
  price: 340.0,
  formattedPrice: '¥340',
  mainImage: '/consumer-market/img_headphones.jpg',
  aspectRatio: 0.75,
  secondaryImages: [
    '/consumer-market/img_headphones.jpg',
    '/consumer-market/img_scene_collector.jpg',
  ],
  category: '音频与器物',
  shortDescription:
    '建筑感方圆形耳罩，鼠尾草绿透气织物，阳极氧化铝实体旋钮控制。',
  aiSummary:
    '录音室级中性声学调音，实体物理按键，3D编制耳垫，久戴不闷。',
  reviews: sampleReviews,
  specs: {
    材质: '3D透气编织网布, 阳极氧化铝合金, 液态硅胶缓冲层',
    发声单元: '40mm 定制生物纤维高解析驱动单元',
    连接方式: '无损蓝牙 5.3 + 3.5mm 模拟音频输入',
    续航时间: '开启 ANC 降噪可连续播放 45 小时 (Type-C 快充)',
  },
  storeName: 'Acoustic Atelier',
  storeDescription:
    '斯德哥尔摩声学实验室，打造专为静心专注而生的极简音频硬件。',
  storeImage: '/consumer-market/img_headphones.jpg',
  contextStory:
    '消除工作空间中的一切视觉杂音与听觉疲劳，让专注自然流动。',
  hasWhiteBg: true,
};

export const keyboardProduct: ProductItem = {
  id: 'p_keyboard_07',
  name: '8Bit 复古双旋钮机械键盘',
  creator: 'Studio K',
  price: 145.0,
  formattedPrice: '¥145',
  mainImage: '/consumer-market/img_keyboard.jpg',
  aspectRatio: 1.77,
  secondaryImages: [
    '/consumer-market/img_keyboard.jpg',
    '/consumer-market/img_scene_collector.jpg',
  ],
  category: '空间器物',
  shortDescription:
    '复古工业计算美学，配双模拟旋转旋钮与经典红白游戏按键。',
  aiSummary:
    '全键热插拔段落机械轴，复古灰酒红 PBT 键帽，独立音量调控双旋钮。',
  reviews: sampleReviews,
  specs: {
    配列: '87键 TKL 配列，配独立铝合金多功能旋钮',
    轴体: '凯华 BOX 白轴 V2 / 佳达隆线性热插拔',
    键帽: '热升华 PBT 原厂高度键帽',
    连接: '三模连接 (2.4GHz 无线, 蓝牙 5.0, Type-C 有线)',
  },
  storeName: 'Studio K',
  storeDescription:
    '柏林设计团队，专注于减法式极简家具构造。',
  storeImage: '/consumer-market/img_keyboard.jpg',
  contextStory:
    '向20世纪末经典工业仪器界面致敬的触感之作。',
  hasWhiteBg: true,
};

export const cratesProduct: ProductItem = {
  id: 'p_crates_08',
  name: '三层铝合金桌面模块化收纳箱',
  creator: 'Atelier NORD',
  price: 125.0,
  formattedPrice: '¥125',
  mainImage: '/consumer-market/img_crates.jpg',
  aspectRatio: 1.33,
  secondaryImages: [
    '/consumer-market/img_crates.jpg',
    '/consumer-market/img_scene_collector.jpg',
  ],
  category: '收纳整理',
  shortDescription:
    '挤压铝合金型材结构，搭载三色工业实用抽拉收纳盒。',
  aiSummary:
    '高强度铝合金型材，搭配滑顺抽拉的堆叠式环保收纳盒，配色亮眼实用。',
  reviews: sampleReviews,
  specs: {
    框架: '2020 欧标 T型槽阳极氧化铝合金型材',
    收纳盒: '重型再生聚丙烯 (落日橙, 鼠尾草绿, 象牙白)',
    尺寸: '宽 38cm × 深 26cm × 高 34cm',
    承重: '单层承重可达 15kg',
  },
  storeName: 'Atelier NORD',
  storeDescription:
    '哥本哈根设计工作室，探索光影、形体与建筑宁静感。',
  storeImage: '/consumer-market/img_crates.jpg',
  contextStory:
    '将精密工坊的秩序感直接引入创意工作室的书桌之上。',
};

export const mobileTableProduct: ProductItem = {
  id: 'p_table_09',
  name: '移动式建筑感亚克力边几',
  creator: 'Maya S. Studio',
  price: 380.0,
  formattedPrice: '¥380',
  mainImage: '/consumer-market/img_mobile_table.jpg',
  aspectRatio: 0.75,
  secondaryImages: [
    '/consumer-market/img_mobile_table.jpg',
    '/consumer-market/img_scene_jungle.jpg',
  ],
  category: '家具',
  shortDescription:
    '亮面朱红色高透亚克力台面，配镀铬模块化钢架与顺滑静音工业万向轮。',
  aiSummary:
    '轻便游牧式空间伴侣，可随心滑行于休闲沙发与工作桌之间。',
  reviews: sampleReviews,
  specs: {
    台面: '12mm 加厚实心浇筑亮光朱红亚克力',
    框架: '镀铬精密结构钢管架',
    移动轮: '4只 360° 静音工业万向刹车轮',
    尺寸: '宽 48cm × 深 38cm × 高 62cm',
  },
  storeName: 'Maya S. Studio',
  storeDescription:
    '京都研修陶艺家，创作兼具实用与雕塑感的空间器物。',
  storeImage: '/consumer-market/img_mobile_table.jpg',
  contextStory:
    '构想为灵活流动的空间托盘，随心承载手冲咖啡、素描本与氛围灯光。',
};

export const linenCoatProduct: ProductItem = {
  id: 'p_coat_10',
  name: '比利时重磅亚麻工装罩衫外套',
  creator: 'Atelier NORD',
  price: 260.0,
  formattedPrice: '¥260',
  mainImage: '/consumer-market/img_outfit_styled_1.jpg',
  aspectRatio: 0.75,
  secondaryImages: [
    '/consumer-market/img_outfit_styled_1.jpg',
    '/consumer-market/img_creator_alex.jpg',
  ],
  category: '生活穿搭',
  shortDescription:
    '420克重磅未经漂白天然比利时亚麻缝制，配天然水牛角扣。',
  aiSummary:
    '透气重磅亚麻面料，具备建筑感的立体垂坠轮廓，越洗越显柔软温润。',
  reviews: sampleReviews,
  specs: {
    面料: '100% 有机比利时天然重磅亚麻 (420gsm)',
    纽扣: '天然水牛角打磨纽扣',
    产地: '葡萄牙 波尔图',
    版型: '箱型宽松廓形剪裁',
  },
  storeName: 'Atelier NORD',
  storeDescription:
    '哥本哈根设计工作室，探索光影、形体与建筑宁静感。',
  storeImage: '/consumer-market/img_outfit_styled_1.jpg',
  contextStory:
    '无论是在采光工作室工作，还是漫步于微凉都市街头，皆自如从容。',
};

export const knitSweaterProduct: ProductItem = {
  id: 'p_sweater_11',
  name: '美丽诺羊毛厚针织开衫',
  creator: 'Studio K',
  price: 220.0,
  formattedPrice: '¥220',
  mainImage: '/consumer-market/img_outfit_styled_2.jpg',
  aspectRatio: 0.75,
  secondaryImages: [
    '/consumer-market/img_outfit_styled_2.jpg',
    '/consumer-market/img_keyboard.jpg',
  ],
  category: '生活穿搭',
  shortDescription:
    '100% 特细无割皮美丽诺羊毛针织开衫，宽松落肩渔夫罗纹织法。',
  aiSummary:
    '宽大落肩廓形配立体渔夫罗纹编织，创意思考时的温暖舒适层次。',
  reviews: sampleReviews,
  specs: {
    纱线: '100% 特细美丽诺纯羊毛 (19.5微米)',
    针织规格: '5针 重磅立体渔夫罗纹',
    版型: '微落肩宽松廓形',
  },
  storeName: 'Studio K',
  storeDescription:
    '柏林设计团队，专注于减法式极简家具构造。',
  storeImage: '/consumer-market/img_outfit_styled_2.jpg',
  contextStory:
    '在操作实体器物时，给予身体如拥抱般的安静温暖。',
};

const curatedProductsList: ProductItem[] = [
  lampProduct,
  chairProduct,
  headphonesProduct,
  keyboardProduct,
  linenCoatProduct,
  knitSweaterProduct,
  cratesProduct,
  mobileTableProduct,
  vesselProduct,
  shelfProduct,
  clockProduct,
];

export const productsList: ProductItem[] = [...collectedDemoProducts, ...curatedProductsList];

export const sampleScene1: ScenePost = {
  id: 'scene_01',
  title: '北欧起居静室画册',
  editorName: 'Elena Vance',
  editorAvatar: '/consumer-market/img_creator_alex.jpg',
  coverImage: '/consumer-market/img_exhibition_apartment.jpg',
  isVideo: false,
  mediaList: [
    '/consumer-market/img_exhibition_apartment.jpg',
    '/consumer-market/img_product_chair.jpg',
    '/consumer-market/img_product_lamp.jpg',
  ],
  linkedProducts: [chairProduct, lampProduct, shelfProduct],
  aspectRatio: 0.85,
  description:
    '静谧的起居空间，将比利时重磅亚麻扶手椅与黄铜暖光台灯完美交融。',
};

export const sampleScene2: ScenePost = {
  id: 'scene_02',
  title: '深夜书房光影漫游',
  editorName: 'Studio NORD',
  editorAvatar: '/consumer-market/img_product_lamp.jpg',
  coverImage: '/consumer-market/img_product_lamp.jpg',
  isVideo: true,
  mediaList: ['/consumer-market/img_product_lamp.jpg', '/consumer-market/img_app_icon.jpg'],
  linkedProducts: [lampProduct, clockProduct],
  aspectRatio: 1.3,
  description:
    '2700K 漫射照明与静音机械时钟，打造沉浸专注的深夜研读场域。',
};

export const sampleScene3: ScenePost = {
  id: 'scene_03',
  title: '触感侘寂茶室角落',
  editorName: 'Maya S.',
  editorAvatar: '/consumer-market/img_creator_alex.jpg',
  coverImage: '/consumer-market/img_creator_alex.jpg',
  isVideo: false,
  mediaList: [
    '/consumer-market/img_creator_alex.jpg',
    '/consumer-market/img_exhibition_apartment.jpg',
  ],
  linkedProducts: [vesselProduct, shelfProduct],
  aspectRatio: 0.95,
  description:
    '天然粗陶素烧花器置于隐形悬浮黑胡桃壁架之上，古朴内敛。',
};

export const sampleScene4: ScenePost = {
  id: 'scene_04',
  title: '植物环抱的工作台绿洲',
  editorName: 'Elena Vance',
  editorAvatar: '/consumer-market/img_creator_alex.jpg',
  coverImage: '/consumer-market/img_scene_jungle.jpg',
  isVideo: true,
  mediaList: ['/consumer-market/img_scene_jungle.jpg', '/consumer-market/img_mobile_table.jpg'],
  linkedProducts: [chairProduct, mobileTableProduct, headphonesProduct],
  aspectRatio: 1.33,
  description:
    '绿意盎然的室内森林书房，芭蕉叶与龟背竹过滤晨光，模块化家具支持随时流转。',
};

export const sampleScene5: ScenePost = {
  id: 'scene_05',
  title: '收藏家书桌的静谧庇护所',
  editorName: 'Luna',
  editorAvatar: '/consumer-market/img_creator_alex.jpg',
  coverImage: '/consumer-market/img_scene_collector.jpg',
  isVideo: false,
  mediaList: [
    '/consumer-market/img_scene_collector.jpg',
    '/consumer-market/img_crates.jpg',
    '/consumer-market/img_keyboard.jpg',
  ],
  linkedProducts: [cratesProduct, keyboardProduct, lampProduct],
  aspectRatio: 0.75,
  description:
    '复古机械按键、蓝色工作灯、实木收纳盒与心爱器物构筑的亲密创意角。',
};

export const scenePostsList: ScenePost[] = [
  sampleScene5,
  sampleScene4,
  sampleScene1,
  sampleScene2,
  sampleScene3,
];

export const feedItemsList: FeedItem[] = [
  { type: 'product', product: headphonesProduct },
  { type: 'scene', scenePost: sampleScene5 },
  { type: 'product', product: keyboardProduct },
  { type: 'scene', scenePost: sampleScene4 },
  { type: 'product', product: linenCoatProduct },
  { type: 'product', product: cratesProduct },
  { type: 'product', product: knitSweaterProduct },
  { type: 'product', product: mobileTableProduct },
  { type: 'scene', scenePost: sampleScene1 },
  { type: 'product', product: lampProduct },
  { type: 'scene', scenePost: sampleScene2 },
  { type: 'product', product: chairProduct },
  { type: 'scene', scenePost: sampleScene3 },
  { type: 'product', product: vesselProduct },
  { type: 'product', product: shelfProduct },
  { type: 'product', product: clockProduct },
];

export const mainExhibition: Exhibition = {
  id: 'ex_first_apartment',
  title: '第一间公寓：空间私语',
  subtitle: '将空间雕琢为你真正的归属。',
  coverImage: '/consumer-market/img_scene_collector.jpg',
  description:
    '一次关于必备触感器物、个人档案与静谧光影的专题策展，将空白墙面化为抚慰心灵的私享庇护所。',
  chapters: [
    {
      chapterNumber: '第一章',
      title: '收藏家的书桌',
      image: '/consumer-market/img_scene_collector.jpg',
      contentText:
        '当实体机械工具、触感器物与柔和灯光相遇，工作台便拥有了灵魂。选择你的核心锚点，构筑独一无二的个人场域。',
      taggedProducts: [keyboardProduct, cratesProduct, lampProduct],
    },
    {
      chapterNumber: '第二章',
      title: '植物书房绿洲',
      image: '/consumer-market/img_scene_jungle.jpg',
      contentText:
        '鲜活的绿植过滤晨间光线，灵动的移动工作台让深度专注与静心休憩自由切换。',
      taggedProducts: [mobileTableProduct, headphonesProduct, chairProduct],
    },
    {
      chapterNumber: '第三章',
      title: '静谧之物',
      image: '/consumer-market/img_exhibition_apartment.jpg',
      contentText:
        '极简家具与天然粗陶吸收了城市喧嚣，在繁忙都市中沉淀出一座宁静避风港。',
      taggedProducts: [chairProduct, vesselProduct, shelfProduct],
    },
  ],
};

export const exhibitionsList: Exhibition[] = [
  mainExhibition,
  {
    id: 'ex_modern_workspaces',
    title: '现代工作台美学',
    subtitle: '触手可及的创意心流工具。',
    coverImage: '/consumer-market/img_scene_jungle.jpg',
    description:
      '一场关于工业铝合金收纳、复古机械键盘、录音室级监听耳机与鲜活绿植空间的视觉礼赞。',
    chapters: [
      {
        chapterNumber: '第一章',
        title: '触感交互界面',
        image: '/consumer-market/img_keyboard.jpg',
        contentText:
          '实体旋钮、机械轴体与模块化铝合金收纳架，让双手重新感知日常创作的纯粹质感。',
        taggedProducts: [keyboardProduct, cratesProduct],
      },
    ],
  },
];

export const sampleCreator: Creator = {
  id: 'c_alex',
  name: 'Alex',
  tagline: '器物 / 空间建筑 / 现代主义',
  portrait: '/consumer-market/img_creator_alex.jpg',
  bio: '居住于柏林的空间设计师，专注于极简住宅空间营造与实体器物策展。',
  gridImages: [
    '/consumer-market/img_scene_collector.jpg',
    '/consumer-market/img_headphones.jpg',
    '/consumer-market/img_keyboard.jpg',
    '/consumer-market/img_scene_jungle.jpg',
    '/consumer-market/img_crates.jpg',
    '/consumer-market/img_mobile_table.jpg',
  ],
  styleTags: ['包豪斯', '极简主义', '温暖原木', '绿植空间', '复古工业'],
};

export const sampleStory: Story = {
  id: 's_bauhaus_workspace',
  title: '我是如何搭建包豪斯工作台的',
  creatorName: 'Alex',
  heroImage: '/consumer-market/img_scene_collector.jpg',
  paragraphs: [
    {
      text: '设计一个专注的工作空间并不是堆砌功能，而是不断去除视觉杂音，直到只留下内心的初衷。',
    },
    {
      text: '我将照明光影与实体机械旋钮作为主要的视觉锚点，柔和的暖光在桌面投下一圈静谧的光晕。',
      image: '/consumer-market/img_keyboard.jpg',
      productRef: keyboardProduct,
    },
    {
      text: '声学宁静与模块化铝合金收纳，让每件器物各得其所，同时让思绪保持前所未有的澄澈。',
      image: '/consumer-market/img_headphones.jpg',
      productRef: headphonesProduct,
    },
  ],
};
