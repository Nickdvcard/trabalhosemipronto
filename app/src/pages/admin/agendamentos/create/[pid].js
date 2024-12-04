import NavAdmin from '@/components/NavAdmin';
import MenuUsers from '@/components/MenuUsers';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import { useRouter } from 'next/router';

export default function CreateAgendamento() {
  const API_URL = `http://localhost:8080/api/agendamentos/`; // URL da API para criar agendamentos
  const router = useRouter();
  const { pid } = router.query;

  const [agendamento, setAgendamento] = useState({
    data: "",
    horaInicio: "",
    horaFim: "",
    descricao: "",
    profissional: "",
    paciente: "",
    mesesRetorno: ""
  });

  useEffect(() => {
    if (pid) {
      setAgendamento((prev) => ({ ...prev, profissional: pid }));
    }
  }, [pid]);

  console.log("pid ", pid)

  const [message, setMessage] = useState({ message: "", status: "" });

  const [diasDisponiveis, setDiasDisponiveis] = useState([]); // Dias da semana que o profissional está disponível
  const [pacientes, setPacientes] = useState([]); // Lista de pacientes
  const [consultasExistentes, setConsultasExistentes] = useState([]);
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!pid) return; // Aguarda até que `pid` seja carregado
    const fetch = async () => {
      try {
        const pacientesResposta = await Axios.get("http://localhost:8080/api/agendamentos/pacientes");
        setPacientes(pacientesResposta.data);
  
        const horariosResposta = await Axios.get(`http://localhost:8080/api/agendamentos/horarios/${pid}`);
        setDiasDisponiveis(horariosResposta.data);
  
        const agendamentosResposta = await Axios.get(`http://localhost:8080/api/agendamentos/idProfissionais/${pid}`);
        setConsultasExistentes(agendamentosResposta.data);
  
        console.log(agendamentosResposta);
      } catch (error) {
        console.error("Erro ao buscar", error);
      }
    };
  
    fetch();
  }, [pid]);

  // Função para obter o nome do dia da semana a partir da data
  const getDiaDaSemana = (data) => {
    const diaDaSemana = new Date(data).getDay(); // Retorna o índice do dia da semana (0 = Domingo, 1 = Segunda, etc.)
    const diasDaSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
    return diasDaSemana[diaDaSemana];
  };

  // Função para validar se o profissional está disponível no dia da semana da data selecionada
  const isDataDisponivel = (data) => {
    const date = new Date(data);
  
    // Define o intervalo de datas entre 20/12 e 10/01
    const startDate = new Date(`${date.getFullYear()}-12-20`);
    const endDate = new Date(`${date.getFullYear() + 1}-01-10`);
  
    // Verifica se a data está no intervalo de 20/12 a 10/01
    if (date >= startDate && date <= endDate) {
      alert(`O atendimento de profissionais está suspenso entre 20/12 e 10/01.`);
      return false;
    }
  
    // Verifica se o profissional está disponível na data (dia da semana)
    const diaNome = getDiaDaSemana(data);
    const diaDisponivel = diasDisponiveis.some(dia => dia.diaSemana === diaNome);
  
    if (!diaDisponivel) {
      const diasDisponiveisString = diasDisponiveis.map(dia => dia.diaSemana).join(', ');
      alert(`O profissional não está disponível nesta data. Dias disponíveis: ${diasDisponiveisString}`);
      return false;
    }
  
    return true; // Se passou por todas as verificações, retorna verdadeiro
  };

  // Função para verificar se a hora está dentro do intervalo permitido para o dia da semana
  const verificarHoraValida = (hora, diaSemana) => {
    const horariosDia = diasDisponiveis.find(dia => dia.diaSemana === diaSemana);
    const horaInicioDia = horariosDia.horaInicio;
    const horaFimDia = horariosDia.horaFim;
  
    if (hora >= horaInicioDia && hora <= horaFimDia) {
      return true; // Hora válida
    } else {
      return false; // Hora inválida
    }
  };

  const verificarConflitoHorario = (horaInicio, horaFim) => {
    //console.log('Iniciando verificação de conflito de horário...');
    
    for (const consulta of consultasExistentes) {
      const consultaDia = consulta.dia.split('T')[0]; // Data do agendamento existente
      const consultaInicio = consulta.horaInicio; // Hora inicial do agendamento existente
      const consultaFim = consulta.horaFim; // Hora final do agendamento existente
  
      // Comparando as datas de agendamento
      if (consultaDia === agendamento.data) {
        //console.log(`Dia de agendamento coincide com o agendamento existente: ${agendamento.data}`);
  
        const horaInicioConsulta = new Date(`${agendamento.data}T${consultaInicio}`);
        const horaFimConsulta = new Date(`${agendamento.data}T${consultaFim}`);
        const horaInicioAgendamento = new Date(`${agendamento.data}T${horaInicio}`);
        const horaFimAgendamento = new Date(`${agendamento.data}T${horaFim}`);
  
        //console.log(`Agendamento sendo verificado: Início: ${horaInicioAgendamento}, Fim: ${horaFimAgendamento}`);
        //console.log(`Horários do agendamento existente: Início: ${horaInicioConsulta}, Fim: ${horaFimConsulta}`);
  
        // Verificação de sobreposição entre os horários
        if (
          (horaInicioAgendamento < horaFimConsulta && horaInicioAgendamento >= horaInicioConsulta) || // O início do novo horário está dentro de um agendamento existente
          (horaFimAgendamento > horaInicioConsulta && horaFimAgendamento <= horaFimConsulta) || // O fim do novo horário está dentro de um agendamento existente
          (horaInicioAgendamento <= horaInicioConsulta && horaFimAgendamento >= horaFimConsulta) // O novo horário envolve totalmente o horário de outro agendamento
        ) {
          //console.log('Conflito de horário encontrado!');
          return true; // Conflito encontrado
        } else {
          //console.log('Nenhum conflito encontrado para este agendamento.');
        }
      } else {
        //console.log(`O dia de agendamento ${agendamento.data} não coincide com o dia do agendamento existente ${consultaDia}.`);
      }
    }
  
    console.log('Nenhum conflito de horário encontrado após todas as verificações.');
    return false; // Sem conflito
  };
  
  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAgendamento({
      ...agendamento,
      [name]: value
    });
  };

  // Função para tratar a criação do agendamento
  const handleCreateAgendamento = async (e) => {
    e.preventDefault();

    if (!agendamento.paciente || !agendamento.descricao || !agendamento.data || !agendamento.horaInicio || !agendamento.horaFim) {
      alert("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    // 1. Verifica se a hora de fim é maior que a hora de início
     if (agendamento.horaFim <= agendamento.horaInicio) {
        alert("A hora de fim deve ser maior que a hora de início.");
        return;
    }

    // 2. Verifica se a data é válida
    if (!isDataDisponivel(agendamento.data)) {
      return;
    }

    // 3. Verifica se a hora de início e fim são válidas para o dia selecionado
    const diaSemana = getDiaDaSemana(agendamento.data);
    const horariosDia = diasDisponiveis.find(dia => dia.diaSemana === diaSemana);
    const horaInicioDia = horariosDia.horaInicio;
    const horaFimDia = horariosDia.horaFim;

    console.log("horas: ", agendamento.horaInicio, agendamento.horaFim);

    // Se alguma das horas (início ou fim) não for válida, retorna um alerta
    if (!verificarHoraValida(agendamento.horaInicio, diaSemana) || !verificarHoraValida(agendamento.horaFim, diaSemana)) {
      alert(`As horas selecionadas não são válidas. No dia ${diaSemana}, os horários disponíveis são entre ${horaInicioDia} e ${horaFimDia}.`);
      return;
    }

    // 4. Verifica conflito de horário
    if (verificarConflitoHorario(agendamento.horaInicio, agendamento.horaFim)) {
        alert("O horário selecionado conflita com outra consulta já marcada para esse profissional.");
        return;
      }

    // 5. Se passar todas as verificações, envia o formulário
    try {
      console.log("agendamento: ", agendamento)
      const response = await Axios.post(API_URL, agendamento);
      const agendamentosResposta = await Axios.get(`http://localhost:8080/api/agendamentos/idProfissionais/${pid}`);
      setConsultasExistentes(agendamentosResposta.data)

      if (response.data && response.data.success === false) {
        console.log(response)
        const message = await response.data; // Lê a mensagem do backend
        alert("Plano de agendamentos não pode ser realizado. Conflito de horário encontrado."); // Exibe a mensagem de alerta
        return; // Aborta a execução se a resposta não for ok
      }

      setMessage({ message: "Agendamento salvo com sucesso!", status: "ok" });
    } catch (error) {
      console.error("Erro ao criar o agendamento:", error);
      setMessage({ message: "Erro ao criar o agendamento!", status: "error" });
    }
  };

  return (
    <>
            <NavAdmin />
            <MenuUsers />
      {/* Cabeçalho e conteúdo do formulário */}
      <div
        className="d-flex justify-content-center p-4"
        style={{ backgroundColor: "#f7f7f7", minHeight: "100vh" }}
      >
        <div className="container">
          <div className="row mb-4 pb-3" style={{ borderBottom: "1px solid #a0a0a0" }}>
            <h3 className="text-success">Cadastro de Agendamento</h3>
          </div>
  
          <form method="POST" id="formAgendamento" onSubmit={handleCreateAgendamento}>
            {/* Seleção de Paciente */}
            <div className="mb-3">
              <label htmlFor="paciente" className="form-label">
                Paciente:
              </label>
              <select
                id="paciente"
                name="paciente"
                className="form-select"
                value={agendamento.paciente}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  -- Selecione --
                </option>
                {pacientes.map((paciente) => (
                  <option key={paciente.idPacientes} value={paciente.idPacientes}>
                    {paciente.primeiroNome} {paciente.ultimoNome}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Campo de Descrição */}
            <div className="mb-3">
              <label htmlFor="descricao" className="form-label">
                Descrição:
              </label>
              <textarea
                id="descricao"
                name="descricao"
                className="form-control"
                rows="3"
                value={agendamento.descricao}
                onChange={(e) =>
                  setAgendamento({ ...agendamento, descricao: e.target.value })
                }
                required
              />
            </div>
  
            {/* Campo de Data */}
            <div className="mb-3">
              <label htmlFor="data" className="form-label">
                Data do Agendamento:
              </label>
              <input
                type="date"
                id="data"
                name="data"
                className="form-control"
                value={agendamento.data}
                onChange={handleChange}
                min={todayDate}
                required
              />
            </div>
  
            {/* Hora de Início */}
            <div className="mb-3">
              <label htmlFor="horaInicio" className="form-label">
                Hora de Início:
              </label>
              <input
                type="time"
                id="horaInicio"
                name="horaInicio"
                className="form-control"
                value={agendamento.horaInicio}
                onChange={handleChange}
                required
                disabled={!agendamento.data}
              />
            </div>
  
            {/* Hora de Fim */}
            <div className="mb-3">
              <label htmlFor="horaFim" className="form-label">
                Hora de Fim:
              </label>
              <input
                type="time"
                id="horaFim"
                name="horaFim"
                className="form-control"
                value={agendamento.horaFim}
                onChange={handleChange}
                required
                disabled={!agendamento.horaInicio}
              />
            </div>
  
            {/* Meses de Retorno */}
            <div className="mb-3">
              <label htmlFor="mesesRetorno" className="form-label">
                Meses de Retorno:
              </label>
              <select
                id="mesesRetorno"
                name="mesesRetorno"
                className="form-select"
                value={agendamento.mesesRetorno}
                onChange={handleChange}
              >
                <option value="">-- Selecione --</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <option key={i} value={i}>
                    {i} meses
                  </option>
                ))}
              </select>
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
  
            {/* Botão de Salvar */}
            <div className="form-group">
              <button type="submit" className="btn btn-success">
                Salvar
              </button>
              <Link
                className="btn btn-outline-info"
                href={pid ? `/admin/agendamentos/index/${pid}` : "#"}
              >
                Voltar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );  
}
