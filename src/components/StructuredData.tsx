'use client';

import { useEffect, useState } from 'react';
import { StructuredDataType } from '@/lib/structured-data';

interface StructuredDataProps {
  data: StructuredDataType | StructuredDataType[] | Promise<StructuredDataType | StructuredDataType[]>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  const [structuredData, setStructuredData] = useState<StructuredDataType | StructuredDataType[] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedData = await Promise.resolve(data);
        setStructuredData(resolvedData);
      } catch (error) {
        console.error('Failed to load structured data:', error);
      }
    };

    loadData();
  }, [data]);

  if (!structuredData) {
    return null;
  }

  const jsonLdArray = Array.isArray(structuredData) ? structuredData : [structuredData];

  return (
    <>
      {jsonLdArray.map((jsonLd, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd, null, 0)
          }}
        />
      ))}
    </>
  );
}