import Axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
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
        <title>Login | Gestão de Espaços</title>
      </Head>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          background: 'var(--bg-app)',
        }}
      >
        <div style={{ width: 380, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Marca />

          <section
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
            }}
          >
            <h1 style={{ margin: '0 0 20px', font: 'var(--type-modal-title)', color: 'var(--text-primary)' }}>Login</h1>

            <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextField
                label="E-mail"
                type="email"
                name="email"
                autoComplete="username"
                value={credenciais.email}
                onChange={handleChange}
                autoFocus
              />

              <TextField
                label="Senha"
                type={mostrarSenha ? 'text' : 'password'}
                name="senha"
                autoComplete="current-password"
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

              <Button type="submit" size="lg" fullWidth disabled={enviando} style={{ marginTop: 4 }}>
                {enviando ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
