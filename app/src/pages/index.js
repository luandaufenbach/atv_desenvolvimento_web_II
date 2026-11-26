import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { obterSessao } from '@/services/auth';

// Página inicial: manda para o Admin (se logado) ou para o Login
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace(obterSessao() ? '/admin' : '/login');
  }, [router]);

  return null;
}
