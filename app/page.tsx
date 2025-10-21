import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

// This page only renders when the user goes to the root path
// Redirect to default locale
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
