import NavAdmin from '@/components/NavAdmin'
import MenuUsers from '@/components/MenuUsers';
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { useRouter } from 'next/router';

export default function EditPaciente() {
  const API_URL = "http://localhost:8080/api/pacientes/id/"; // URL para editar o paciente
  const router = useRouter();
  const { pid } = router.query;  // Obtenção do ID (pid) diretamente da URL

  const [paciente, setPaciente] = useState({
    primeiroNome: "",
    ultimoNome: "",
    observacoes: "",
    teacher: "",
    condition: "",
    logradouro: "",
    numero: "",
    complemento: "",
    cep: "",
    uf: "",
    cidade: "",
    bairro: ""
  });

  const [message, setMessage] = useState({ message: "", status: "" });

  const [teachers, setTeachers] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [ufs, setUfs] = useState([]);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [cidadesFiltradas, setCidadesFiltradas] = useState([]);
  const [bairrosFiltrados, setBairrosFiltrados] = useState([]);

  useEffect(() => {
    if (!pid) return;  // Evitar requisição se o pid não estiver disponível

    const fetchData = async () => {
      try {
        const teachersResposta = await Axios.get("http://localhost:8080/api/pacientes/pedagogos");
        console.log('Teachers:', teachersResposta.data);

        const conditionsResposta = await Axios.get("http://localhost:8080/api/pacientes/condicoes");
        console.log('Conditions:', conditionsResposta.data);

        const ufsResposta = await Axios.get("http://localhost:8080/api/pacientes/ufs");
        console.log('Ufs:', ufsResposta.data);

        const citiesResposta = await Axios.get("http://localhost:8080/api/pacientes/cidades");
        console.log('Cidades:', citiesResposta.data);

        const neighborhoodsResposta = await Axios.get("http://localhost:8080/api/pacientes/bairros");
        console.log('Bairros:', neighborhoodsResposta.data);

        const pacienteResposta = await Axios.get(API_URL + pid);
        console.log('Paciente:', pacienteResposta.data);

        setTeachers(teachersResposta.data);
        setConditions(conditionsResposta.data);
        setUfs(ufsResposta.data);
        setCities(citiesResposta.data);
        setNeighborhoods(neighborhoodsResposta.data);

        setPaciente(pacienteResposta.data[0]);

        paciente.cep = pacienteResposta.data[0].CEP
        console.log(paciente.cep);
        console.log(paciente.cep);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [pid]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPaciente({
      ...paciente,
      [name]: value
    });
  };

  const handleUfChange = (event) => {
    const ufSelecionada = event.target.value;
    setPaciente({ ...paciente, uf: ufSelecionada, cidade: "", bairro: "" });

    // Filtra as cidades com base no UF selecionado
    const cidadesFiltradas = cities.filter(city => city.uf_cidade == ufSelecionada);
    setCidadesFiltradas(cidadesFiltradas);
  };

  const handleCityChange = (event) => {
    const cidadeSelecionada = event.target.value;
    setPaciente({ ...paciente, cidade: cidadeSelecionada, bairro: "" });

    // Filtra os bairros com base na cidade selecionada
    const bairrosFiltrados = neighborhoods.filter(neighborhood => neighborhood.cidade_bairro == cidadeSelecionada);
    setBairrosFiltrados(bairrosFiltrados);
  };

  const handleUpdatePaciente = async () => {
    if (!paciente.first_name || !paciente.last_name || !paciente.teacher || !paciente.condition || !paciente.uf || !paciente.cidade || !paciente.bairro) {
      setMessage({ message: "Todos os campos devem ser preenchidos!", status: "error" });
      return;
    }
    
    try {
      console.log("antes do envio: ", paciente);
      const response = await Axios.put(API_URL + pid, paciente);
      setMessage({ message: "Paciente atualizado com sucesso!", status: "ok" });
    } catch (error) {
      console.error('Erro ao atualizar o Paciente:', error);
      setMessage({ message: "Erro ao atualizar o Paciente!", status: "error" });
    }
  };

  return (
    <>
      <Head>
        <title>APP-BC</title>
        <meta name="description" content="Página de edição de Paciente" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div>
        <NavAdmin />
        <MenuUsers />
      </div>
  
      <div className="d-flex justify-content-center p-4" style={{ backgroundColor: '#f7f7f7' }}>
        <div className="container">
          <div className="row mb-4 pb-3" style={{ borderBottom: '1px solid #a0a0a0' }}>
            <h3 className="text-success">Edição de Paciente</h3>
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
                value={paciente.primeiroNome}
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
                value={paciente.ultimoNome}
                onChange={handleChange}
                required
              />
            </div>
  
            {/* Observações */}
            <div className="mb-3">
              <label htmlFor="observacoes" className="form-label">Observações:</label>
              <textarea
                id="observacoes"
                name="observacoes"
                className="form-control"
                placeholder="Observações opcionais"
                maxLength="200"
                value={paciente.observacoes}
                onChange={handleChange}
              />
            </div>
  
            {/* Profissionais Pedagogos */}
            <div className="mb-3">
              <label htmlFor="teachers" className="form-label">Profissionais Pedagogos:</label>
              <select
                id="teachers"
                name="teacher"
                className="form-select"
                value={paciente.teacher}
                onChange={handleChange}
                required
              >
                <option value="" disabled>-- Selecione --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.idProfissionais} value={teacher.idProfissionais}>
                    {teacher.primeiroNome} {teacher.ultimoNome}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Condição */}
            <div className="mb-3">
              <label htmlFor="conditions" className="form-label">Condição:</label>
              <select
                id="conditions"
                name="condition"
                className="form-select"
                value={paciente.condition}
                onChange={handleChange}
                required
              >
                <option value="" disabled>-- Selecione --</option>
                {conditions.map((condition) => (
                  <option key={condition.idCondicoes} value={condition.idCondicoes}>
                    {condition.nome}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Logradouro */}
            <div className="mb-3">
              <label htmlFor="logradouro" className="form-label">Logradouro:</label>
              <input
                type="text"
                id="logradouro"
                name="logradouro"
                className="form-control"
                value={paciente.logradouro}
                onChange={handleChange}
                maxLength="45"
                required
              />
            </div>
  
            {/* Número */}
            <div className="mb-3">
              <label htmlFor="numero" className="form-label">Número:</label>
              <input
                type="number"
                id="numero"
                name="numero"
                className="form-control"
                value={paciente.numero}
                onChange={handleChange}
                required
              />
            </div>
  
            {/* Complemento */}
            <div className="mb-3">
              <label htmlFor="complemento" className="form-label">Complemento:</label>
              <input
                type="text"
                id="complemento"
                name="complemento"
                className="form-control"
                value={paciente.complemento}
                onChange={handleChange}
                maxLength="200"
                placeholder="Opcional"
              />
            </div>
  
            {/* CEP */}
            <div className="mb-3">
              <label htmlFor="cep" className="form-label">CEP:</label>
              <input
                type="text"
                id="cep"
                name="cep"
                className="form-control"
                value={paciente.cep}
                onChange={handleChange}
                pattern="\d{5}-\d{3}"
                title="Formato: 12345-678"
                placeholder="Formato: 12345-678"
                maxLength="9"
              />
            </div>
  
            {/* UF */}
            <div className="mb-3">
              <label htmlFor="uf" className="form-label">Estado (UF):</label>
              <select
                id="uf"
                name="uf"
                className="form-select"
                value={paciente.uf}
                onChange={handleUfChange}
                required
              >
                <option value="" disabled>-- Selecione --</option>
                {ufs.map((uf) => (
                  <option key={uf.idUFs} value={uf.idUFs}>{uf.nome}</option>
                ))}
              </select>
            </div>
  
            {/* Cidade */}
            <div className="mb-3">
              <label htmlFor="cidade" className="form-label">Cidade:</label>
              <select
                id="cidade"
                name="cidade"
                className="form-select"
                value={paciente.cidade}
                onChange={handleCityChange}
                required
                disabled={!paciente.uf}
              >
                <option value="" disabled>-- Selecione --</option>
                {cidadesFiltradas.map((city) => (
                  <option key={city.idCidades} value={city.idCidades}>
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Bairro */}
            <div className="mb-3">
              <label htmlFor="bairro" className="form-label">Bairro:</label>
              <select
                id="bairro"
                name="bairro"
                className="form-select"
                value={paciente.bairro}
                onChange={handleChange}
                required
                disabled={!paciente.cidade}
              >
                <option value="" disabled>-- Selecione --</option>
                {bairrosFiltrados.map((neighborhood) => (
                  <option key={neighborhood.idBairros} value={neighborhood.idBairros}>
                    {neighborhood.nome}
                  </option>
                ))}
              </select>
            </div>

            {message.status && (
          <div
            className={`alert ${message.status === "ok" ? "alert-success" : "alert-danger"}`}
            role="alert"
          >
            {message.message}
            <Link className="alert-link" href="/admin/pacientes">Voltar</Link>
          </div>
        )}
  
            {/* Botões */}
            <div className="form-group">
              <button type="button" className="btn btn-success" onClick={handleUpdatePaciente}>Atualizar Paciente</button>
              <Link className="btn btn-outline-info" href="/admin/pacientes">Voltar</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );  
}
