'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { addToCart, createCart, getCart, updateCartLine } from '@/lib/shopify';

const COOKIE = 'opg_cart';

export async function addItem(formData: FormData) {
  const variantId = String(formData.get('variantId') ?? '');
  const quantity = Math.max(1, Number(formData.get('quantity') ?? 1));
  if (!variantId) return;

  const jar = await cookies();
  const existingId = jar.get(COOKIE)?.value;
  let cart = existingId ? await getCart(existingId).catch(() => null) : null;

  cart = cart
    ? await addToCart(cart.id, variantId, quantity)
    : await createCart(variantId, quantity);

  jar.set(COOKIE, cart.id, { path: '/', httpOnly: true, sameSite: 'lax', secure: !!process.env.VERCEL, maxAge: 60 * 60 * 24 * 14 });
  revalidatePath('/', 'layout');
  redirect('/cart');
}

export async function setQuantity(formData: FormData) {
  const lineId = String(formData.get('lineId') ?? '');
  const quantity = Math.max(0, Number(formData.get('quantity') ?? 0));
  const jar = await cookies();
  const cartId = jar.get(COOKIE)?.value;
  if (!cartId || !lineId) return;
  await updateCartLine(cartId, lineId, quantity);
  revalidatePath('/', 'layout');
}

export async function readCart() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  return getCart(id).catch(() => null);
}
