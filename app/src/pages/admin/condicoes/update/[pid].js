import NavAdmin from '@/components/NavAdmin';
import MenuUsers from '@/components/MenuUsers';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function EditCondicao() {
  const API_URL = "http://localhost:8080/api/condicoes/id/"; // Base da API
  const router = useRouter();
  const { pid } = router.query; // Obtém o ID da condição a partir da URL

  const [condicao, setCondicao] = useState({
    nome: "",
    descricao: "",
  });

  const [message, setMessage] = useState({ message: "", status: "" });

  // Busca as condi;óes disponíveis
  useEffect(() => {
    const fetchCondicao = async () => {
        try {
          const response = await Axios.get(API_URL + pid);
          setCondicao(response.data);
        } catch (error) {
          console.error('Erro ao buscar condições:', error);
        }
      };
      fetchCondicao();
    }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCondicao({
      ...condicao,
      [name]: value,
    });
  };

  const handleUpdateCondicao = async () => {
    if (!condicao.nome || !condicao.descricao) {
      setMessage({ message: "Por favor, preencha todos os campos.", status: "error" });
      return;
    }
    
    try {
      // Envia os dados da condição como segundo parâmetro na requisição PUT
      await Axios.put(API_URL + pid, condicao);
      setMessage({ message: "Condição atualizada com sucesso!", status: "ok" });
    } catch (error) {
      console.error('Erro ao atualizar a condição:', error);
      setMessage({ message: "Erro ao atualizar a condição!", status: "error" });
    }
  };
  
  return (
    <>
      <NavAdmin />
      <MenuUsers />
      <div className="d-flex justify-content-center p-4" style={{ backgroundColor: '#f7f7f7', minHeight: '100vh' }}>
        <div className="container">
          <div className="row mb-4 pb-3" style={{ borderBottom: '1px solid #a0a0a0' }}>
            <h3 className="text-success">Edição de Condição</h3>
          </div>

          <form method="POST" id="formEdicao">
            {/* Nome da Condição */}
            <div className="mb-3">
              <label htmlFor="nome" className="form-label">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                className="form-control"
                maxLength="100"
                value={condicao.nome}
                onChange={handleChange}
                required
              />
            </div>

            {/* Descrição da Condição */}
            <div className="mb-3">
              <label htmlFor="descricao" className="form-label">Descrição:</label>
              <textarea
                id="descricao"
                name="descricao"
                className="form-control"
                rows="4"
                maxLength="255"
                value={condicao.descricao}
                onChange={handleChange}
              />
            </div>

            {/* Feedback */}
            {message.status === "ok" && (
              <div className="alert alert-success" role="alert">
                {message.message}
              </div>
            )}
            {message.status === "error" && (
              <div className="alert alert-danger" role="alert">
                {message.message}
              </div>
            )}

            {/* Botões */}
            <div className="form-group">
              <button type="button" className="btn btn-success" onClick={handleUpdateCondicao}>Salvar</button>
              <Link className="btn btn-outline-info" href="/admin/condicoes">Voltar</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
