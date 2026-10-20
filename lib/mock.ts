// Sample catalog used only when SHOPIFY_MOCK=1 (offline testing).
// Mirrors a few real OP Green listings; the live site reads Shopify instead.
import type { Cart, Collection, Product, ProductCard } from './shopify';

const usd = (amount: string) => ({ amount, currencyCode: 'USD' });
const img = (file: string, alt: string) => ({
  url: `https://cdn.shopify.com/s/files/1/0852/7278/9242/files/${file}`,
  altText: alt,
  width: 1000,
  height: 1000,
});

function product(
  handle: string,
  title: string,
  image: ReturnType<typeof img>,
  variants: [string, string, boolean][],
  description: string,
  collections: string[],
): Product & { collections: string[] } {
  const prices = variants.map((v) => Number(v[1]));
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title,
    availableForSale: variants.some((v) => v[2]),
    featuredImage: image,
    priceRange: { minVariantPrice: usd(Math.min(...prices).toFixed(2)) },
    compareAtPriceRange: { maxVariantPrice: usd('0.00') },
    description,
    descriptionHtml: `<p>${description}</p>`,
    seo: { title: null, description: null },
    images: { nodes: [image] },
    variants: {
      nodes: variants.map(([t, p, a], i) => ({
        id: `gid://shopify/ProductVariant/${handle}-${i}`,
        title: t,
        availableForSale: a,
        price: usd(p),
        compareAtPrice: null,
      })),
    },
    collections,
  };
}

const PRODUCTS = [
  product('golden-pothos-3-5-pot-op-green-grown', 'Golden Pothos – 3.5" Pot – OP Green Grown',
    img('op-green-golden-pothos-3-5in.png', 'Golden pothos in a 3.5 inch pot'),
    [['3.5" Pot', '6.99', true]],
    'Greenhouse-grown by OP Green. A healthy, rooted Golden Pothos grown and packed by us.',
    ['live-plants', 'start-here-grown-in-my-greenhouse']),
  product('variegated-spider-plant-3-5-pot-op-green-grown', 'Variegated Spider Plant – 3.5" Pot – OP Green Grown',
    img('op-green-variegated-spider-plant-3-5in.png', 'Variegated spider plant'),
    [['3.5" Pot', '6.99', true]],
    'Greenhouse-grown by OP Green. A healthy, rooted Variegated Spider Plant in a 3.5-inch pot.',
    ['live-plants', 'start-here-grown-in-my-greenhouse']),
  product('tradescantia-zebrina-cuttings-op-green-grown', 'Tradescantia zebrina Cuttings – OP Green Grown',
    img('IMG_8748_1.jpg', 'Tradescantia zebrina cuttings'),
    [['Unrooted Cutting', '1.99', true], ['Rooted Cutting', '3.49', true]],
    'Silver-green striped leaves with purple tones. Choose unrooted or rooted.',
    ['live-plants']),
  product('the-plant-propagation-master-guide', 'The Plant Propagation Master Guide',
    img('OPGreen-Plant-Propagation-Master-Guide_Cover.png', 'Propagation guide cover'),
    [['Default Title', '7.00', true]],
    'Turn one houseplant into many: exactly where to cut, how to root, and what to do when cuttings fail.',
    ['greenhouse-guides', 'digital-guides']),
  product('the-greenhouse-cold-weather-playbook', 'The Greenhouse Cold-Weather Playbook',
    img('OPGreen-Cold-Weather-Playbook_Cover.png', 'Cold-weather playbook cover'),
    [['Default Title', '14.99', true]],
    'A visual 22-page playbook for keeping a greenhouse productive through cold weather.',
    ['greenhouse-guides', 'digital-guides']),
  product('greenhouse-winterization-planner', 'Greenhouse Winterization Planner (Free Download)',
    img('op-green-greenhouse-winterization-planner.png', 'Winterization planner cover'),
    [['Default Title', '0.00', true]],
    'Free: prepare your greenhouse for cold weather with a simple, low-cost winter plan.',
    ['greenhouse-guides', 'digital-guides']),
];

const TITLES: Record<string, string> = {
  'live-plants': 'Live Plants – OP Green Grown',
  'greenhouse-guides': 'Greenhouse Guides',
  'digital-guides': 'Digital Guides',
  'start-here-grown-in-my-greenhouse': 'Start Here – Grown in My Greenhouse',
};

const card = (p: Product): ProductCard => ({
  id: p.id, handle: p.handle, title: p.title, availableForSale: p.availableForSale,
  featuredImage: p.featuredImage, priceRange: p.priceRange, compareAtPriceRange: p.compareAtPriceRange,
});

export const mockAllProducts = () => PRODUCTS;

export function mockCollection(handle: string): Collection | null {
  if (handle === 'all') return { title: 'All Products', description: '', products: { nodes: PRODUCTS.map(card) } };
  if (!TITLES[handle]) return null;
  return {
    title: TITLES[handle],
    description: '',
    products: { nodes: PRODUCTS.filter((p) => p.collections.includes(handle)).map(card) },
  };
}

export function mockProduct(handle: string): Product | null {
  return PRODUCTS.find((p) => p.handle === handle) ?? null;
}

export class MockCart {
  private carts = new Map<string, { variantId: string; qty: number }[]>();

  private build(id: string): Cart {
    const lines = this.carts.get(id) ?? [];
    const nodes = lines.map((l, i) => {
      const p = PRODUCTS.find((x) => x.variants.nodes.some((v) => v.id === l.variantId))!;
      const v = p.variants.nodes.find((x) => x.id === l.variantId)!;
      return {
        id: `${id}-line-${i}`,
        quantity: l.qty,
        cost: { totalAmount: usd((Number(v.price.amount) * l.qty).toFixed(2)) },
        merchandise: { id: v.id, title: v.title, product: { title: p.title, handle: p.handle, featuredImage: p.featuredImage } },
      };
    });
    const subtotal = nodes.reduce((s, n) => s + Number(n.cost.totalAmount.amount), 0);
    return {
      id,
      checkoutUrl: 'https://opgreen.myshopify.com/cart',
      totalQuantity: lines.reduce((s, l) => s + l.qty, 0),
      cost: { subtotalAmount: usd(subtotal.toFixed(2)) },
      lines: { nodes },
    };
  }

  get(id: string) { return this.carts.has(id) ? this.build(id) : null; }

  create(variantId: string, qty: number) {
    const id = `mock-cart-${Date.now()}`;
    this.carts.set(id, [{ variantId, qty }]);
    return this.build(id);
  }

  add(id: string, variantId: string, qty: number) {
    const lines = this.carts.get(id) ?? [];
    const existing = lines.find((l) => l.variantId === variantId);
    if (existing) existing.qty += qty; else lines.push({ variantId, qty });
    this.carts.set(id, lines);
    return this.build(id);
  }

  update(id: string, lineId: string, qty: number) {
    const lines = this.carts.get(id) ?? [];
    const idx = Number(lineId.split('-line-')[1]);
    if (qty <= 0) lines.splice(idx, 1); else if (lines[idx]) lines[idx].qty = qty;
    this.carts.set(id, lines);
    return this.build(id);
  }
}
