import NavAdmin from '@/components/NavAdmin'
import MenuUsers from '@/components/MenuUsers';
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { useRouter } from 'next/router';

export default function EditProfissional() {
  const API_URL = "http://localhost:8080/api/profissionais/id/"; // URL para editar o profissional
  const router = useRouter();
  const { pid } = router.query;  // Obtenção do ID (pid) diretamente da URL

  const [profissional, setProfissional] = useState({
    primeiroNome: "",
    ultimoNome: "",
    pedagogo: "",
    profissao: "",
    horarios: "",
  });

  const [message, setMessage] = useState({ message: "", status: "" });
  const [profissoes, setProfissoes] = useState([]);
  const [numPeriodos, setNumPeriodos] = useState(0);
  const [periodos, setPeriodos] = useState([]);

  // Busca as profissões disponíveis
  useEffect(() => {
    const fetchProfissoes = async () => {
      try {
        const response = await Axios.get(`http://localhost:8080/api/profissionais/profissoes`);
        setProfissoes(response.data);
      } catch (error) {
        console.error('Erro ao buscar profissões:', error);
      }
    };
    fetchProfissoes();
  }, []);

  // Busca os dados do profissional ao carregar a página
  useEffect(() => {
    if (!pid) return; // Aguarda o ID estar disponível

    const fetchProfissional = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        const data = response.data[0];

        console.log("data: ", data);

        // Formata os períodos de horários para exibição
        const horariosArray = data.horarios.split("; ").map((horario) => {
          const [horas, dia] = horario.split(", ");
          const [horaInicio, horaFim] = horas.split("-");
          return { dia, horaInicio, horaFim, isHoraFimEnabled: true };
        });

        setProfissional({
          primeiroNome: data.primeiroNome,
          ultimoNome: data.ultimoNome,
          pedagogo: data.pedagogo,
          profissao: data.profissao,
          horarios: data.horarios,
        });

        console.log("profissional: ", profissional);

        setNumPeriodos(horariosArray.length);
        setPeriodos(horariosArray);
      } catch (error) {
        console.error('Erro ao buscar dados do profissional:', error);
        setMessage({ message: "Erro ao buscar dados do profissional", status: "error" });
      }
    };

    fetchProfissional();
  }, [pid]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfissional({
      ...profissional,
      [name]: value,
    });
  };

  const handleNumPeriodosChange = (event) => {
    const value = parseInt(event.target.value) || 0;
    setNumPeriodos(value);

    // Inicializa os períodos com base no número inserido
    const novosPeriodos = Array(value).fill({ dia: "", horaInicio: "", horaFim: "", isHoraFimEnabled: false });
    setPeriodos(novosPeriodos);
  };

  const handlePeriodoChange = (index, field, value) => {
    const novosPeriodos = [...periodos];

    novosPeriodos[index] = {
      ...novosPeriodos[index],
      [field]: value,
    };

    if (field === "horaInicio") {
      novosPeriodos[index].isHoraFimEnabled = true;
    }

    if (field === "horaFim" && novosPeriodos[index].horaInicio && value < novosPeriodos[index].horaInicio) {
      alert("Hora de Fim não pode ser menor que Hora de Início");
      novosPeriodos[index].horaFim = "";
    }

    setPeriodos(novosPeriodos);

    const horariosFormatados = novosPeriodos
      .map((p) => `${p.horaInicio}-${p.horaFim}, ${p.dia}`)
      .join("; ");
    setProfissional({ ...profissional, horarios: horariosFormatados });
  };

  const handleUpdateProfissional = async () => {
  // Validação dos campos obrigatórios
  if (!profissional.primeiroNome || !profissional.ultimoNome || !profissional.pedagogo || !profissional.profissao || !profissional.horarios) {
    setMessage({ message: "Todos os campos devem ser preenchidos!", status: "error" });
    return;
  }

  // Verificação dos períodos
  if (numPeriodos > 0) {
    for (let i = 0; i < numPeriodos; i++) {
      if (!periodos[i].dia || !periodos[i].horaInicio || !periodos[i].horaFim) {
        setMessage({ message: `Período ${i + 1} não está completo!`, status: "error" });
        return;
      }
    }
  }

    try {
      console.log(profissional);
      await Axios.put(API_URL + pid, profissional);
      setMessage({ message: "Profissional atualizado com sucesso!", status: "ok" });
    } catch (error) {
      console.error('Erro ao atualizar o Profissional:', error);
      setMessage({ message: "Erro ao atualizar o Profissional!", status: "error" });
    }
  };

  return (
    <>
    <NavAdmin />
    <MenuUsers />
      {/* Cabeçalho e conteúdo do formulário */}
      <div className="d-flex justify-content-center p-4" style={{ backgroundColor: '#f7f7f7' }}>
        <div className="container">
          <div className="row mb-4 pb-3" style={{ borderBottom: '1px solid #a0a0a0' }}>
            <h3 className="text-success">Editar Cadastro de Profissional</h3>
          </div>

          <form method="POST" id="formEdicao">
            {/* Primeiro Nome */}
            <div className="mb-3">
              <label htmlFor="primeiroNome" className="form-label">Primeiro Nome:</label>
              <input
                type="text"
                id="primeiroNome"
                name="primeiroNome"
                className="form-control"
                maxLength="45"
                value={profissional.primeiroNome}
                onChange={handleChange}
                required
              />
            </div>

            {/* Último Nome */}
            <div className="mb-3">
              <label htmlFor="ultimoNome" className="form-label">Último Nome:</label>
              <input
                type="text"
                id="ultimoNome"
                name="ultimoNome"
                className="form-control"
                maxLength="45"
                value={profissional.ultimoNome}
                onChange={handleChange}
                required
              />
            </div>

            {/* Pedagogo */}
            <div className="mb-3">
              <label htmlFor="pedagogo" className="form-label">É pedagogo?</label>
              <select
                id="pedagogo"
                name="pedagogo"
                className="form-select"
                value={profissional.pedagogo}
                onChange={handleChange}
                required
              >
                <option value="" disabled>-- Selecione --</option>
                <option value="1">Sim</option>
                <option value="0">Não</option>
              </select>
            </div>

            {/* Profissão */}
            <div className="mb-3">
              <label htmlFor="profissao" className="form-label">Profissão:</label>
              <select
                id="profissao"
                name="profissao"
                className="form-select"
                value={profissional.profissao}
                onChange={handleChange}
                required
              >
                <option value="" disabled>-- Selecione uma profissão --</option>
                {profissoes.map((profissao) => (
                  <option key={profissao.idProfissoes} value={profissao.idProfissoes}>
                    {profissao.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Períodos Dinâmicos */}
            {Array.from({ length: numPeriodos }, (_, index) => (
              <div className="mb-4" key={index}>
                <h5>Período {index + 1}</h5>
                <div className="row">
                  <div className="col-md-4">
                    <label htmlFor={`dia-${index}`} className="form-label">Dia da Semana:</label>
                    <select
                      id={`dia-${index}`}
                      className="form-select"
                      value={periodos[index]?.dia || ""}
                      onChange={(e) => handlePeriodoChange(index, "dia", e.target.value)}
                    >
                      <option value="" disabled>-- Selecione --</option>
                      <option value="segunda">Segunda-feira</option>
                      <option value="terca">Terça-feira</option>
                      <option value="quarta">Quarta-feira</option>
                      <option value="quinta">Quinta-feira</option>
                      <option value="sexta">Sexta-feira</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor={`horaInicio-${index}`} className="form-label">Hora Início:</label>
                    <input
                      type="time"
                      id={`horaInicio-${index}`}
                      className="form-control"
                      value={periodos[index]?.horaInicio || ""}
                      onChange={(e) => handlePeriodoChange(index, "horaInicio", e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor={`horaFim-${index}`} className="form-label">Hora Fim:</label>
                    <input
                      type="time"
                      id={`horaFim-${index}`}
                      className="form-control"
                      value={periodos[index]?.horaFim || ""}
                      onChange={(e) => handlePeriodoChange(index, "horaFim", e.target.value)}
                      disabled={!periodos[index]?.isHoraFimEnabled}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Feedback */}
            {message.status === "ok" && (
              <div className="alert alert-success mt-3" role="alert">
                {message.message}
              </div>
            )}
            {message.status === "error" && (
              <div className="alert alert-danger mt-3" role="alert">
                {message.message}
              </div>
            )}

            {/* Botões */}
            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleUpdateProfissional}
              >
                Atualizar
              </button>
              <Link className="btn btn-outline-info" href="/admin/profissionais">
                Voltar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );

}