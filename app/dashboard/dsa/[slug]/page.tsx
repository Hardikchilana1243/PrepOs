import { redirect } from 'next/navigation';

interface SlugRedirectProps {
  params: {
    slug: string;
  };
}

export default function SlugRedirectPage({ params }: SlugRedirectProps) {
  redirect(`/dashboard/dsa/problem/${params.slug}`);
}
