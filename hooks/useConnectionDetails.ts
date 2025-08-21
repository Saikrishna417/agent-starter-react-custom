import { useCallback } from 'react';
import type { ConnectionDetails } from '@/app/api/connection-details/route';

export type Language = 'en' | 'kn' | 'hi';

export default function useConnectionDetails() {
  // Pass the selected language to the token endpoint
  const fetchConnectionDetails = useCallback(
    async (language: Language = 'en'): Promise<ConnectionDetails> => {
      const url = new URL(
        process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
        window.location.origin
      );
      url.searchParams.set('language', language);

      try {
        const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());
        return (await res.json()) as ConnectionDetails;
      } catch (error) {
        console.error('Error fetching connection details:', error);
        throw new Error('Error fetching connection details!');
      }
    },
    []
  );

  return { fetchConnectionDetails };
}
