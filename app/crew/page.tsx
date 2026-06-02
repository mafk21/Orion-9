'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CrewIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/crew/team');
  }, [router]);

  return null;
}
