import Link from 'next/link';
import { formatMoney, type ProductCard as Card } from '@/lib/shopify';
import { sized } from '@/lib/img';

export default function ProductCard({ p }: { p: Card }) {
  const min = p.priceRange.minVariantPrice;
  const compare = p.compareAtPriceRange.maxVariantPrice;
  const onSale = Number(compare.amount) > Number(min.amount);
  const free = Number(min.amount) === 0;

  return (
    <Link href={`/products/${p.handle}`} className="card">
      <div className="thumb">
        {p.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(p.featuredImage.url, 600)} alt={p.featuredImage.altText ?? p.title} loading="lazy" />
        )}
        {!p.availableForSale && <span className="badge">Sold out</span>}
        {p.availableForSale && free && <span className="badge">Free</span>}
      </div>
      <h3>{p.title}</h3>
      <div className="price">
        {free ? 'Free' : formatMoney(min)}
        {onSale && <s>{formatMoney(compare)}</s>}
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Card[] }) {
  if (!products.length) return <p className="empty">Nothing here right now. Check back soon.</p>;
  return (
    <div className="grid">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
