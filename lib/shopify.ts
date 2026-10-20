import { mockCollection, mockProduct, mockAllProducts, MockCart } from './mock';

export type Money = { amount: string; currencyCode: string };
export type Image = { url: string; altText: string | null; width?: number; height?: number };

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { maxVariantPrice: Money };
};

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
};

export type Product = ProductCard & {
  descriptionHtml: string;
  description: string;
  images: { nodes: Image[] };
  variants: { nodes: Variant[] };
  seo: { title: string | null; description: string | null };
};

export type Collection = {
  title: string;
  description: string;
  products: { nodes: ProductCard[] };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string; featuredImage: Image | null };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money };
  lines: { nodes: CartLine[] };
};

const MOCK = process.env.SHOPIFY_MOCK === '1';
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'opgreen.myshopify.com';
const VERSION = process.env.SHOPIFY_API_VERSION || '2025-07';
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: { cache?: 'no-store'; revalidate?: number } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['X-Shopify-Storefront-Access-Token'] = TOKEN;

  const res = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    ...(opts.cache
      ? { cache: opts.cache }
      : { next: { revalidate: opts.revalidate ?? 300 } }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Shopify Storefront error: ${JSON.stringify(json.errors ?? res.status)}`);
  }
  return json.data as T;
}

const CARD = `
  id handle title availableForSale
  featuredImage { url altText width height }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { maxVariantPrice { amount currencyCode } }
`;

const CART = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) { nodes {
    id quantity
    cost { totalAmount { amount currencyCode } }
    merchandise { ... on ProductVariant {
      id title
      product { title handle featuredImage { url altText } }
    } }
  } }
`;

export async function getCollection(handle: string): Promise<Collection | null> {
  if (MOCK) return mockCollection(handle);
  if (handle === 'all') {
    const d = await storefront<{ products: { nodes: ProductCard[] } }>(
      `query { products(first: 100, sortKey: TITLE) { nodes { ${CARD} } } }`,
    );
    return { title: 'All Products', description: '', products: d.products };
  }
  const d = await storefront<{ collection: Collection | null }>(
    `query($handle: String!) { collection(handle: $handle) {
      title description
      products(first: 100) { nodes { ${CARD} } }
    } }`,
    { handle },
  );
  return d.collection;
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (MOCK) return mockProduct(handle);
  const d = await storefront<{ product: Product | null }>(
    `query($handle: String!) { product(handle: $handle) {
      ${CARD}
      description descriptionHtml
      seo { title description }
      images(first: 10) { nodes { url altText width height } }
      variants(first: 100) { nodes {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      } }
    } }`,
    { handle },
  );
  return d.product;
}

export async function getAllProductHandles(): Promise<string[]> {
  if (MOCK) return mockAllProducts().map((p) => p.handle);
  const d = await storefront<{ products: { nodes: { handle: string }[] } }>(
    `query { products(first: 250) { nodes { handle } } }`,
  );
  return d.products.nodes.map((p) => p.handle);
}

// ---------- Cart (never cached) ----------

const mockCart = new MockCart();

export async function getCart(id: string): Promise<Cart | null> {
  if (MOCK) return mockCart.get(id);
  const d = await storefront<{ cart: Cart | null }>(
    `query($id: ID!) { cart(id: $id) { ${CART} } }`,
    { id },
    { cache: 'no-store' },
  );
  return d.cart;
}

export async function createCart(merchandiseId: string, quantity: number): Promise<Cart> {
  if (MOCK) return mockCart.create(merchandiseId, quantity);
  const d = await storefront<{ cartCreate: { cart: Cart; userErrors: { message: string }[] } }>(
    `mutation($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) {
      cart { ${CART} } userErrors { message }
    } }`,
    { lines: [{ merchandiseId, quantity }] },
    { cache: 'no-store' },
  );
  if (d.cartCreate.userErrors.length) throw new Error(d.cartCreate.userErrors[0].message);
  return d.cartCreate.cart;
}

export async function addToCart(cartId: string, merchandiseId: string, quantity: number): Promise<Cart> {
  if (MOCK) return mockCart.add(cartId, merchandiseId, quantity);
  const d = await storefront<{ cartLinesAdd: { cart: Cart; userErrors: { message: string }[] } }>(
    `mutation($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART} } userErrors { message }
    } }`,
    { cartId, lines: [{ merchandiseId, quantity }] },
    { cache: 'no-store' },
  );
  if (d.cartLinesAdd.userErrors.length) throw new Error(d.cartLinesAdd.userErrors[0].message);
  return d.cartLinesAdd.cart;
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  if (MOCK) return mockCart.update(cartId, lineId, quantity);
  const d = await storefront<{ cartLinesUpdate: { cart: Cart; userErrors: { message: string }[] } }>(
    `mutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART} } userErrors { message }
    } }`,
    { cartId, lines: [{ id: lineId, quantity }] },
    { cache: 'no-store' },
  );
  if (d.cartLinesUpdate.userErrors.length) throw new Error(d.cartLinesUpdate.userErrors[0].message);
  return d.cartLinesUpdate.cart;
}

export function formatMoney(m: Money): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: m.currencyCode }).format(
    Number(m.amount),
  );
}
