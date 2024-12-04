import { useState } from 'react';
import Axios from 'axios';
import Head from 'next/head';
import styles from '../styles/login.module.css';
import { useRouter } from 'next/router';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const router = useRouter();

    // Função de submit para o formulário de login
    const handleSubmit = async (e) => {
        e.preventDefault(); 

        try {
            // Faz a requisição POST para a rota de login do backend
            const response = await Axios.post('http://localhost:8080/api/usuarios/login', {
                username,
                senha: password
            });

            setSuccessMessage(response.data.message);
            setError(null); 

            router.push('/admin');
        } catch (error) {
            if (error.response) {
                setError(error.response.data.error);
            } else {
                setError('Erro desconhecido, tente novamente mais tarde');
            }
            setSuccessMessage(null); 
        }
    };

    return (
        <div className={styles['login-body']}>
            {/* Seção da Imagem */}
            <div className={styles['login-image']}></div>

            {/* Seção da Caixa de Login */}
            <div className={styles['login-box']}>
                <div className={styles['login-header']}>
                    <h2>Agenda APAE - Login</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Usuário"
                        className={styles['input-field']}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        className={styles['input-field']}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className={styles['submit-btn']}>
                        Entrar
                    </button>
                </form>

                {/* Exibindo Mensagem de Erro ou Sucesso */}
                {error && <div className={styles['error-message']}>{error}</div>}
                {successMessage && <div className={styles['success-message']}>{successMessage}</div>}

                <a href="/" className={styles['back-link']}>
                    Voltar
                </a>
            </div>
        </div>
    );
}
