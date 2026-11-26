import Axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import TextField from '@/components/ui/TextField';
import Marca from '@/components/Marca';
import { API, mensagemDeErro } from '@/services/api';
import { obterSessao, salvarSessao } from '@/services/auth';

export default function Login() {
  const API_URL = `${API}/login`;
  const router = useRouter();

  const [credenciais, setCredenciais] = useState({ email: '', senha: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Quem já está logado vai direto para o Admin
  useEffect(() => {
    if (obterSessao()) router.replace('/admin');
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredenciais({
      ...credenciais,
      [name]: value,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!credenciais.email || !credenciais.senha) {
      setMensagem({ message: 'Informe e-mail e senha.', status: 'error' });
      return;
    }

    setEnviando(true);
    try {
      const response = await Axios.post(API_URL, credenciais);
      salvarSessao(response.data.usuario);
      router.push('/admin');
    } catch (error) {
      // Login falhou: mostra o erro e continua na página de Login
      setMensagem({ message: mensagemDeErro(error, 'Erro ao realizar o login!'), status: 'error' });
      setCredenciais({ ...credenciais, senha: '' });
      setEnviando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Entrar · Gestão de Espaços</title>
      </Head>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          background: 'var(--glow-gold), var(--bg-app)',
        }}
      >
        <div style={{ width: 400, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <Marca />

          <section
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-raised)',
              padding: 28,
            }}
          >
            <h1 style={{ margin: 0, font: 'var(--type-modal-title)', color: 'var(--text-primary)' }}>Entrar</h1>
            <p style={{ margin: '6px 0 0', font: '400 14px/20px var(--font-sans)', color: 'var(--text-muted)' }}>
              Acesse o painel com seu e-mail e senha.
            </p>

            <div style={{ height: 1, background: 'var(--border-default)', margin: '20px 0' }} />

            <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <TextField
                label="E-mail"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="ex.: ana@email.com"
                prefixIcon="mail"
                size="lg"
                value={credenciais.email}
                onChange={handleChange}
                autoFocus
              />

              <TextField
                label="Senha"
                type={mostrarSenha ? 'text' : 'password'}
                name="senha"
                autoComplete="current-password"
                placeholder="Sua senha"
                prefixIcon="lock"
                size="lg"
                value={credenciais.senha}
                onChange={handleChange}
                suffix={
                  <IconButton
                    icon={mostrarSenha ? 'visibility_off' : 'visibility'}
                    label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    size="sm"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  />
                }
              />

              <Alert mensagem={mensagem} />

              <Button type="submit" size="lg" caps fullWidth iconRight={enviando ? undefined : 'arrow_forward'} disabled={enviando}>
                {enviando ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </section>

          <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, font: '400 12px/16px var(--font-sans)', color: 'var(--text-muted)' }}>
            <Icon name="shield" size={16} />
            Acesso restrito a usuários cadastrados.
          </p>
        </div>
      </main>
    </>
  );
}
