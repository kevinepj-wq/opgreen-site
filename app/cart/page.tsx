import Link from 'next/link';
import { readCart, setQuantity } from './actions';
import { formatMoney, FREE_SHIPPING_MIN, FLAT_SHIPPING } from '@/lib/shopify';
import { sized } from '@/lib/img';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your cart' };

export default async function CartPage() {
  const cart = await readCart();
  const lines = cart?.lines.nodes ?? [];

  if (!cart || lines.length === 0) {
    return (
      <div className="wrap empty">
        <h1>Your cart is empty</h1>
        <p>Start with plants from our greenhouse or a practical growing guide.</p>
        <p><Link href="/collections/live-plants" className="btn">Shop Our Plants</Link></p>
      </div>
    );
  }

  const plantTotal = lines
    .filter((l) => l.merchandise.requiresShipping)
    .reduce((sum, l) => sum + Number(l.cost.totalAmount.amount), 0);
  const toGo = FREE_SHIPPING_MIN - plantTotal;
  const usd = (n: number) => formatMoney({ amount: n.toFixed(2), currencyCode: 'USD' });

  return (
    <div className="wrap cart">
      <h1>Your cart</h1>
      {plantTotal > 0 && (
        <div className="ship-meter">
          {toGo > 0 ? (
            <>Add <strong>{usd(toGo)}</strong> more in plants for <strong>free shipping</strong>. Otherwise shipping is {usd(FLAT_SHIPPING)}.</>
          ) : (
            <><strong>Free shipping unlocked.</strong> Your plants ship free.</>
          )}
          <div className="bar"><span style={{ width: `${Math.min(100, (plantTotal / FREE_SHIPPING_MIN) * 100)}%` }} /></div>
        </div>
      )}
      {lines.map((l) => (
        <div className="line" key={l.id}>
          {l.merchandise.product.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sized(l.merchandise.product.featuredImage.url, 200)} alt="" />
          ) : <div />}
          <div>
            <Link href={`/products/${l.merchandise.product.handle}`} style={{ textDecoration: 'none', fontWeight: 600 }}>
              {l.merchandise.product.title}
            </Link>
            {l.merchandise.title !== 'Default Title' && <div className="meta">{l.merchandise.title}</div>}
            <form action={setQuantity} className="qty" style={{ marginTop: 8 }}>
              <input type="hidden" name="lineId" value={l.id} />
              <button name="quantity" value={l.quantity - 1} aria-label="Decrease">−</button>
              <span>{l.quantity}</span>
              <button name="quantity" value={l.quantity + 1} aria-label="Increase">+</button>
              <button name="quantity" value={0} style={{ width: 'auto', padding: '0 10px', fontSize: '.85rem' }}>Remove</button>
            </form>
          </div>
          <div className="price">{formatMoney(l.cost.totalAmount)}</div>
        </div>
      ))}
      <div className="totals">
        <span>Subtotal</span>
        <span>{formatMoney(cart.cost.subtotalAmount)}</span>
      </div>
      <a href={cart.checkoutUrl} className="btn full">Checkout</a>
      <p className="note" style={{ textAlign: 'center' }}>
        Plants ship free on orders of $35+, otherwise $7.99. Guides never ship. Taxes calculated at checkout. Shop Pay, Apple Pay and Google Pay accepted.
      </p>
    </div>
  );
}
