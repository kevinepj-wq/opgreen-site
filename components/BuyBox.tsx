'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addItem } from '@/app/cart/actions';
import type { Variant } from '@/lib/shopify';

function money(v: { amount: string; currencyCode: string }) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: v.currencyCode }).format(Number(v.amount));
}

function Submit({ disabled, free }: { disabled: boolean; free: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn full" type="submit" disabled={disabled || pending}>
      {disabled ? 'Sold out' : pending ? 'Adding…' : free ? 'Get it free' : 'Add to cart'}
    </button>
  );
}

export default function BuyBox({ variants }: { variants: Variant[] }) {
  const firstAvailable = variants.find((v) => v.availableForSale) ?? variants[0];
  const [id, setId] = useState(firstAvailable?.id);
  const v = variants.find((x) => x.id === id) ?? firstAvailable;
  if (!v) return null;

  const single = variants.length === 1 && v.title === 'Default Title';
  const free = Number(v.price.amount) === 0;
  const onSale = v.compareAtPrice && Number(v.compareAtPrice.amount) > Number(v.price.amount);

  return (
    <form action={addItem} style={{ display: 'grid', gap: 14 }}>
      <div className="price">
        {free ? 'Free' : money(v.price)}
        {onSale && <s>{money(v.compareAtPrice!)}</s>}
      </div>

      {!single && (
        <div className="field">
          <label htmlFor="variant">Option</label>
          <select id="variant" value={v.id} onChange={(e) => setId(e.target.value)}>
            {variants.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title} — {money(x.price)}{x.availableForSale ? '' : ' (sold out)'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field" style={{ maxWidth: 120 }}>
        <label htmlFor="quantity">Quantity</label>
        <input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
      </div>

      <input type="hidden" name="variantId" value={v.id} />
      <Submit disabled={!v.availableForSale} free={free} />
    </form>
  );
}
