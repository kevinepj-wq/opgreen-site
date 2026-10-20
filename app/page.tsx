import Link from 'next/link';
import { getCollection, getProduct, formatMoney } from '@/lib/shopify';
import { ProductGrid } from '@/components/ProductCard';
import { sized } from '@/lib/img';

export const revalidate = 300;

export default async function Home() {
  const [plants, guides, master] = await Promise.all([
    getCollection('live-plants').catch(() => null),
    getCollection('greenhouse-guides').catch(() => null),
    getProduct('the-plant-propagation-master-guide').catch(() => null),
  ]);

  const heroImg = plants?.products.nodes.find((p) => p.featuredImage)?.featuredImage;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <div className="eyebrow">OP GREEN</div>
            <h1>Grown in Our Greenhouse.</h1>
            <p>Healthy, rooted plants and cuttings we grow and pack ourselves, plus simple guides to help them thrive.</p>
            <div className="actions">
              <Link href="/collections/live-plants" className="btn">Shop Our Plants</Link>
              <Link href="/collections/greenhouse-guides" className="btn ghost">Browse Guides</Link>
            </div>
          </div>
          <div className="hero-img">
            {heroImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(heroImg.url, 1000)} alt={heroImg.altText ?? 'Plants grown by OP Green'} />
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Ready to Ship from Our Greenhouse</h2>
            <Link href="/collections/live-plants">View all →</Link>
          </div>
          <ProductGrid products={plants?.products.nodes ?? []} />
        </div>
      </section>

      {master && (
        <section className="section alt">
          <div className="wrap feature">
              <div>
                <div className="eyebrow">Digital guide</div>
                <h2>{master.title}</h2>
                <p>{master.description.slice(0, 220)}{master.description.length > 220 ? '…' : ''}</p>
                <div className="actions">
                  <Link href={`/products/${master.handle}`} className="btn">
                    Get the guide · {formatMoney(master.priceRange.minVariantPrice)}
                  </Link>
                </div>
              </div>
              <div className="hero-img" style={{ aspectRatio: '1' }}>
                {master.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sized(master.featuredImage.url, 900)} alt={master.featuredImage.altText ?? master.title} style={{ objectFit: 'contain' }} />
                )}
              </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Greenhouse &amp; Growing Guides</h2>
            <Link href="/collections/greenhouse-guides">View all →</Link>
          </div>
          <ProductGrid products={guides?.products.nodes ?? []} />
        </div>
      </section>

      <section className="section alt">
        <div className="wrap values">
          <div><h3>Grown by us</h3><p>Our live plants come from our own greenhouse, rooted and packed by hand.</p></div>
          <div><h3>Practical, not fussy</h3><p>Beginner-friendly guides built from what actually works in a real greenhouse.</p></div>
          <div><h3>Instant downloads</h3><p>Digital guides arrive by email right after checkout. Nothing ships.</p></div>
        </div>
      </section>
    </>
  );
}
