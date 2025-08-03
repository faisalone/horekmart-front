'use client';

import { useParams, notFound } from 'next/navigation';
import HelpPage from '@/components/HelpPage';
import { helpPagesData } from '@/data/helpData';

export default function DynamicHelpPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Get the page data from our TypeScript data
  const pageData = helpPagesData[slug];

  // If page doesn't exist, show 404
  if (!pageData) {
    notFound();
  }

  return <HelpPage pageData={pageData} />;
}
