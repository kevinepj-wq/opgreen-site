# OP GREEN storefront (Next.js on Vercel)

Your own OP GREEN website, styled after the Shopify store, with products,
prices, inventory, cart and checkout pulled live from `opgreen.myshopify.com`.
Edit a product in Shopify and this site shows it within 5 minutes.

Cost: $0 (Vercel Hobby plan, Shopify plan you already pay for).

## Deploy to the opgreenadmin@gmail.com Vercel account (about 10 minutes)

1. Sign in to GitHub and create a new **private** repository named `opgreen-site`
   (https://github.com/new). Leave it empty.
2. Unzip this folder and upload its contents to that repo
   ("uploading an existing file" link on the empty repo page; drag everything in,
   including `.env.example` and `.gitignore`). Commit.
3. Sign in to https://vercel.com as **opgreenadmin@gmail.com** →
   **Add New → Project** → import `opgreen-site` from GitHub.
4. Under **Environment Variables** add:
   - `SHOPIFY_STORE_DOMAIN` = `opgreen.myshopify.com`
   - `NEXT_PUBLIC_NOINDEX` = `1`
5. Click **Deploy**. You get a URL like `opgreen-site.vercel.app`.
6. Test: open a product, add to cart, press Checkout. It should land on your
   normal Shopify checkout. (Don't pay; close the tab.)

## How it works

- `lib/shopify.ts` – Shopify Storefront API (tokenless; a token is optional via
  `SHOPIFY_STOREFRONT_TOKEN`).
- `app/page.tsx` – homepage: hero, Live Plants collection, Propagation Guide
  feature, Greenhouse Guides collection.
- `app/collections/[handle]`, `app/products/[handle]` – same URLs as Shopify,
  so links keep working when the domain moves here.
- `app/cart` – cart stored in Shopify; Checkout sends the buyer to Shopify's
  checkout (Shop Pay, Apple Pay, Google Pay, digital delivery all unchanged).
- Images are served by Shopify's CDN, so Vercel image limits don't apply.

## Search engines

`NEXT_PUBLIC_NOINDEX=1` keeps Google from indexing this copy while the Shopify
store is still your main site (two copies would compete). At cutover set it to
`0` and point your domain here.

## Testing without Shopify

`SHOPIFY_MOCK=1 npm run build && SHOPIFY_MOCK=1 npm start` uses a small
built-in sample catalog.

## Later: fully independent

When this site is proven, the remaining move off Shopify is: Stripe Checkout,
your own guide-download delivery, shipping labels, and dropping Shopify
Collective items (they only work on Shopify). Only worth doing once sales exist.
