// The offer and the referring creator come from the funnel at runtime (offer set, `is_ref` deal).
// Pages take them as props so the same page works with real data and in the preview.

export type Offer = {
  price: number;
  currency: string;
  period: 'week' | 'month' | 'year';
  /** Creator or store discount on the first payment, 0 when there is none. */
  discountPercent: number;
};

export type Creator = {
  name: string;
  avatarUrl: string | null;
};

/** Props every landing page takes; the funnel (or the local preview) supplies them. */
export type LandingProps = {
  offer: Offer;
  /** The creator whose page the buyer came from (`is_ref`), if any. */
  creator: Creator | null;
  /** Opens checkout in the funnel. */
  onStart: () => void;
};

/** What each `pages/<slug>/index.ts` exports next to its default page component. */
export type LandingMeta = {
  /** Browser tab title. */
  title: string;
  appStoreUrl: string;
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export function describeOffer(offer: Offer) {
  const regular = `${formatMoney(offer.price, offer.currency)}/${offer.period}`;
  if (!offer.discountPercent) {
    return { regular, today: null, terms: `${regular} until canceled. Cancel anytime.` };
  }
  const today = formatMoney(Math.round(offer.price * (100 - offer.discountPercent)) / 100, offer.currency);
  return { regular, today, terms: `${today} today, then ${regular} until canceled. Cancel anytime.` };
}

export const initials = (name: string) =>
  name.split(/\s+/).map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase();
