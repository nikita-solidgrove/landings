import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import type { Creator, LandingMeta, LandingProps, Offer } from './shared/offer';
import './styles.css';

/*
 * Local preview of the landings. Every `pages/<slug>/index.ts` is a page at `/<slug>`; no list to
 * keep in sync. In a funnel the offer comes from the published offer set and the creator from the
 * `is_ref` deal; here they are samples.
 *   /<slug>       the page
 *   ?ref=0        a visitor without a creator referral
 */

type PageModule = { default: ComponentType<LandingProps>; meta: LandingMeta };

const modules = import.meta.glob<PageModule>('./pages/*/index.ts', { eager: true });
const PAGES = Object.fromEntries(
  Object.entries(modules).map(([path, module]) => [path.split('/')[2], module]),
);

const params = new URLSearchParams(window.location.search);
const referred = params.get('ref') !== '0';

const SAMPLE_OFFER: Offer = { price: 29.99, currency: 'USD', period: 'year', discountPercent: referred ? 25 : 0 };
const SAMPLE_CREATOR: Creator = { name: 'Lena Brooks', avatarUrl: null };

const slug = window.location.pathname.replace(/^\/|\/$/g, '');
const current = PAGES[slug];

function Index() {
  return (
    <main className='landings-index'>
      <h1>Landings</h1>
      <ul>
        {Object.entries(PAGES).map(([key, module]) => (
          <li key={key}>
            <a href={`/${key}`}>{module.meta.title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

document.title = current ? current.meta.title : 'Landings';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {current ? (
      <current.default
        offer={SAMPLE_OFFER}
        creator={referred ? SAMPLE_CREATOR : null}
        onStart={() => window.alert('Checkout opens here in the funnel.')}
      />
    ) : (
      <Index />
    )}
  </StrictMode>,
);
