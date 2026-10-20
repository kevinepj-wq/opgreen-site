import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { readCart } from './cart/actions';
import { LOGO } from '@/lib/img';

const noindex = process.env.NEXT_PUBLIC_NOINDEX !== '0';

export const metadata: Metadata = {
  title: { default: 'OP GREEN – Greenhouse-Grown Plants & Practical Growing Guides', template: '%s – OP GREEN' },
  description:
    'Live plants and cuttings grown in our own greenhouse, plus practical guides for propagation, greenhouses and low-cost hydroponics.',
  robots: noindex ? { index: false, follow: false } : undefined,
  icons: { icon: LOGO },
};

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/collections/live-plants', label: 'Live Plants' },
  { href: '/products/the-plant-propagation-master-guide', label: 'Propagation Guide' },
  { href: '/collections/greenhouse-guides', label: 'Guides' },
  { href: '/collections/all', label: 'Shop All' },
  { href: '/contact', label: 'Contact' },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cart = await readCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <html lang="en">
      <body>
        <div className="announce">Grown in our own greenhouse · Digital guides delivered instantly</div>
        <header className="header">
          <div className="wrap">
            <Link href="/" className="logo" aria-label="OP GREEN home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${LOGO}?height=120`} alt="OP GREEN" />
            </Link>
            <nav className="nav" aria-label="Main">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>{n.label}</Link>
              ))}
            </nav>
            <Link href="/cart" className="cart-link">
              Cart{count > 0 && <span>{count}</span>}
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="wrap">
            <div className="cols">
              <div>
                <h4>OP GREEN</h4>
                <p style={{ maxWidth: '38ch', margin: 0 }}>
                  Practical, beginner-friendly growing: live plants from our greenhouse and guides that
                  turn one plant into many.
                </p>
              </div>
              <div>
                <h4>Shop</h4>
                <ul>
                  <li><Link href="/collections/live-plants">Live Plants</Link></li>
                  <li><Link href="/collections/greenhouse-guides">Greenhouse Guides</Link></li>
                  <li><Link href="/collections/digital-guides">Digital Guides</Link></li>
                  <li><Link href="/collections/all">Shop All</Link></li>
                </ul>
              </div>
              <div>
                <h4>Help</h4>
                <ul>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><a href="https://opgreen.myshopify.com/policies/refund-policy">Refund policy</a></li>
                  <li><a href="https://opgreen.myshopify.com/policies/privacy-policy">Privacy policy</a></li>
                  <li><a href="https://opgreen.myshopify.com/policies/terms-of-service">Terms of service</a></li>
                </ul>
              </div>
            </div>
            <div className="fine">© {new Date().getFullYear()} OP GREEN. Secure checkout powered by Shopify.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
