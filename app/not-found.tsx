import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap empty">
      <h1>Page not found</h1>
      <p>That page may have moved. Try the full shop instead.</p>
      <p><Link href="/collections/all" className="btn">Shop All</Link></p>
    </div>
  );
}
