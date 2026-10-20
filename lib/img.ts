// Shopify's CDN resizes on the fly, so we ask it for the width we need
// instead of using Vercel image optimization (keeps the Hobby plan at $0).
export function sized(url: string | undefined | null, width: number): string {
  if (!url) return '';
  const u = new URL(url);
  u.searchParams.set('width', String(width));
  return u.toString();
}

export const LOGO =
  'https://cdn.shopify.com/s/files/1/0852/7278/9242/files/op-green-logo-concept-with-one-plant-greener-tagline.png';
