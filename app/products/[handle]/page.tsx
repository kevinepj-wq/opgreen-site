import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/shopify';
import { sized } from '@/lib/img';
import BuyBox from '@/components/BuyBox';

export const revalidate = 300;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle).catch(() => null);
  if (!p) return { title: 'Product' };
  return {
    title: p.seo.title || p.title,
    description: p.seo.description || p.description.slice(0, 160),
    openGraph: p.featuredImage ? { images: [sized(p.featuredImage.url, 1200)] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) notFound();

  const images = p.images.nodes.length ? p.images.nodes : p.featuredImage ? [p.featuredImage] : [];
  const [main, ...rest] = images;
  const isDigital = /digital|guide|planner|playbook|workbook|logbook/i.test(p.title);

  return (
    <div className="wrap pdp">
      <div className="gallery">
        <div className="main">
          {main && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sized(main.url, 1100)} alt={main.altText ?? p.title} />
          )}
        </div>
        {rest.length > 0 && (
          <div className="thumbs">
            {rest.slice(0, 5).map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.url} src={sized(img.url, 240)} alt={img.altText ?? p.title} loading="lazy" />
            ))}
          </div>
        )}
      </div>

      <div className="buy">
        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)' }}>{p.title}</h1>
        <BuyBox variants={p.variants.nodes} />
        <div className="trust">
          {isDigital ? (
            <>
              <div>✓ Instant PDF download, sent to your email after checkout</div>
              <div>✓ Nothing ships, so there's no shipping cost</div>
            </>
          ) : (
            <>
              <div>✓ Shipping calculated at checkout</div>
            </>
          )}
          <div>✓ Secure checkout powered by Shopify</div>
        </div>
        <div className="desc" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
      </div>
    </div>
  );
}
