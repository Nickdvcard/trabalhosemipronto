import NavAdmin from '@/components/NavAdmin'
import MenuUsers from '@/components/MenuUsers';
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import Axios from 'axios';

export default function CreatePaciente() {
  const API_URL = "http://localhost:8080/api/pacientes"; // URL da API para criar paciente

  const [paciente, setPaciente] = useState({
    first_name: "",
    last_name: "",
    observations: "",
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
  const [cidadesFiltradas, setcidadesFiltradas] = useState([]);  // Estado para as cidades filtradas
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [bairrosFiltrados, setbairrosFiltrados] = useState([]);  // Estado para os bairros filtrados

  // Função para buscar os dados
  useEffect(() => {
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

        setTeachers(teachersResposta.data);
        setConditions(conditionsResposta.data);
        setUfs(ufsResposta.data);
        setCities(citiesResposta.data);
        setNeighborhoods(neighborhoodsResposta.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

// Função que filtra as cidades com base no estado (UF) selecionado
const handleUfChange = (event) => {
  const ufSelecionada = event.target.value;
  console.log('UF Selecionado:', ufSelecionada);  // Verificando valor do UF

  setPaciente({ ...paciente, uf: ufSelecionada, cidade: "", bairro: "" });

  // Filtra as cidades com base no UF selecionado
  const cidadesFiltradas = cities.filter(city => city.uf_cidade == ufSelecionada);
  console.log('Cidades Filtradas:', cidadesFiltradas);  // Verificando cidades filtradas
  setcidadesFiltradas(cidadesFiltradas);
};

// Função que filtra os bairros com base na cidade selecionada
const handleCityChange = (event) => {
  const cidadeSelecionada = event.target.value;
  console.log('Cidade Selecionada:', cidadeSelecionada);  // Verificando valor da cidade

  setPaciente({ ...paciente, cidade: cidadeSelecionada, bairro: "" });

  // Filtra os bairros com base na cidade selecionada
  const bairrosFiltrados = neighborhoods.filter(neighborhood => neighborhood.cidade_bairro == cidadeSelecionada);
  console.log('Bairros Filtrados:', bairrosFiltrados);  // Verificando bairros filtrados
  setbairrosFiltrados(bairrosFiltrados);
};


  const handleChange = (event) => {
    const { name, value } = event.target;
    setPaciente({
      ...paciente,
      [name]: value
    });
  };

  const handleCreatePaciente = async () => {

    if (!paciente.first_name || !paciente.last_name || !paciente.teacher || !paciente.condition || !paciente.uf || !paciente.cidade || !paciente.bairro) {
      setMessage({ message: "Todos os campos devem ser preenchidos!", status: "error" });
      return;
    }

    try {
      const response = await Axios.post(API_URL, paciente);
      setMessage({ message: "Paciente salvo com sucesso!", status: "ok" });
    } catch (error) {
      console.error('Erro ao criar o Paciente:', error);
      setMessage({ message: "Erro ao criar o Paciente!", status: "error" });
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
            <h3 className="text-success">Cadastro de Paciente</h3>
          </div>
  
          <form method="POST" id="formCadastro">
            {/* Primeiro Nome */}
            <div className="mb-3">
              <label htmlFor="first_name" className="form-label">Primeiro Nome:</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="form-control"
                maxLength="45"
                value={paciente.first_name}
                onChange={handleChange}
                required
              />
            </div>
  
            {/* Último Nome */}
            <div className="mb-3">
              <label htmlFor="last_name" className="form-label">Último Nome:</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="form-control"
                maxLength="45"
                value={paciente.last_name}
                onChange={handleChange}
                required
              />
            </div>
  
            {/* Observações */}
            <div className="mb-3">
              <label htmlFor="observations" className="form-label">Observações:</label>
              <textarea
                id="observations"
                name="observations"
                className="form-control"
                placeholder="Observações opcionais"
                maxLength="200"
                value={paciente.observations}
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
  
            {/* Exibir mensagem de feedback */}
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
  
            {/* Botão de Salvar */}
            <div className="form-group">
              <button type="button" className="btn btn-success" onClick={handleCreatePaciente}>Salvar Paciente</button>
              <Link className="btn btn-outline-info" href="/admin/pacientes">Voltar</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
  
}
