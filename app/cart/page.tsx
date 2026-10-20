import Link from 'next/link';
import { readCart, setQuantity } from './actions';
import { formatMoney } from '@/lib/shopify';
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

  return (
    <div className="wrap cart">
      <h1>Your cart</h1>
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
        Shipping and taxes are calculated at checkout. Shop Pay, Apple Pay and Google Pay accepted.
      </p>
    </div>
  );
}
