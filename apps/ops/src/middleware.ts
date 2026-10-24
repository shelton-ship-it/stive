import { locales, defaultLocale } from '@stive/i18n';

export function middleware(request: { nextUrl: { pathname: string }; headers: { get: (name: string) => string | null } }) {
  return null;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
