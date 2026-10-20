import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/shopify';
import { ProductGrid } from '@/components/ProductCard';

export const revalidate = 300;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCollection(handle).catch(() => null);
  return { title: c?.title ?? 'Shop', description: c?.description || undefined };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const c = await getCollection(handle);
  if (!c) notFound();

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head" style={{ display: 'block' }}>
          <h1>{c.title}</h1>
          {c.description && <p className="note" style={{ maxWidth: '60ch' }}>{c.description}</p>}
        </div>
        <ProductGrid products={c.products.nodes} />
      </div>
    </section>
  );
}
