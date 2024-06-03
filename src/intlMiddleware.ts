import createMiddleware from 'next-intl/middleware';

export const intlMiddleware = createMiddleware({
  locales: ['en', 'ru', 'zh'],
  defaultLocale: 'en'
});
