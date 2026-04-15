import { redirect } from 'next/navigation';

export default function ProductBasePage() {
  // Redirect users who visit /product directly to the shop page
  redirect('/shop');
}
