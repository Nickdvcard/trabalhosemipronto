import NavAdmin from '@/components/NavAdmin';
import MenuUsers from '@/components/MenuUsers';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import { useRouter } from 'next/router';

export default function EditAgendamento() {
  const API_URL = 'http://localhost:8080/api/agendamentos/id/'; // URL da API para editar agendamentos
  const router = useRouter();
  const { pid } = router.query; // Obter IDs da rota

  const [agendamento, setAgendamento] = useState({
    data: '',
    horaInicio: '',
    horaFim: '',
    descricao: '',
    profissional: '',
    paciente: '',
  });

  useEffect(() => {
    if (pid) {
      setAgendamento((prev) => ({ ...prev, profissional: pid }));
    }
  }, [pid]);

  const [message, setMessage] = useState({ message: '', status: '' });
  const [diasDisponiveis, setDiasDisponiveis] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [consultasExistentes, setConsultasExistentes] = useState([]);
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetch = async () => {
      try {
        // Buscar os dados do agendamento que será editado
        const agendamentoResposta2 = await Axios.get(`http://localhost:8080/api/agendamentos/id/${pid}`);
        if (agendamentoResposta2.data && agendamentoResposta2.data[0]) {
          const agendamentoFormatado = {
            ...agendamentoResposta2.data[0],
            dia: agendamentoResposta2.data[0].dia.split('T')[0], // Remove o horário da data
          };
          setAgendamento(agendamentoFormatado);
  
          console.log("ag formatado presente: ", agendamentoFormatado);
  
          // Buscar horários do profissional
          if (agendamentoResposta2.data[0].profissional) {
            const horariosResposta = await Axios.get(`http://localhost:8080/api/agendamentos/horarios/${agendamentoResposta2.data[0].profissional}`);
            setDiasDisponiveis(horariosResposta.data);
            console.log("horarios prof: ", horariosResposta);
          }
  
          // Buscar agendamentos existentes do profissional
          const agendamentosResposta = await Axios.get(`http://localhost:8080/api/agendamentos/idProfissionais/${agendamentoResposta2.data[0].profissional}`);
          setConsultasExistentes(agendamentosResposta.data);
        }
  
        // Buscar lista de pacientes
        const pacientesResposta = await Axios.get('http://localhost:8080/api/agendamentos/pacientes');
        setPacientes(pacientesResposta.data);
  
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
  
    if (pid) {
      fetch();
    }
  }, [pid]);
  

  const getDiaDaSemana = (data) => {
    const diaDaSemana = new Date(data).getDay();
    const diasDaSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    return diasDaSemana[diaDaSemana];
  };

  const isDataDisponivel = (data) => {
    const date = new Date(data);
    const startDate = new Date(`${date.getFullYear()}-12-20`);
    const endDate = new Date(`${date.getFullYear() + 1}-01-10`);

    if (date >= startDate && date <= endDate) {
      alert('O atendimento de profissionais está suspenso entre 20/12 e 10/01.');
      return false;
    }

    const diaNome = getDiaDaSemana(data);
    const diaDisponivel = diasDisponiveis.some((dia) => dia.diaSemana === diaNome);

    console.log("diaNome: ", diaNome ," vs diaDisponivel", diaDisponivel);

    if (!diaDisponivel) {
      const diasDisponiveisString = diasDisponiveis.map((dia) => dia.diaSemana).join(', ');
      alert(`O profissional não está disponível nesta data. Dias disponíveis: ${diasDisponiveisString}`);
      return false;
    }

    return true;
  };

  const verificarHoraValida = (hora, diaSemana) => {
    const horariosDia = diasDisponiveis.find((dia) => dia.diaSemana === diaSemana);
    const horaInicioDia = horariosDia.horaInicio;
    const horaFimDia = horariosDia.horaFim;

    return hora >= horaInicioDia && hora <= horaFimDia;
  };

  const verificarConflitoHorario = (horaInicio, horaFim) => {
    console.log('Iniciando verificação de conflito de horário...');
    
    for (const consulta of consultasExistentes) {
      const consultaDia = consulta.dia.split('T')[0]; // Data do agendamento existente
      const consultaInicio = consulta.horaInicio; // Hora inicial do agendamento existente
      const consultaFim = consulta.horaFim; // Hora final do agendamento existente
  
      // Verifica se o agendamento atual não é o mesmo que o de edição
      if (consulta.idAgendamentos !== agendamento.idAgendamentos) {  // Verifique o ID do agendamento
        // Comparando as datas de agendamento
        if (consultaDia === agendamento.dia) {
          console.log(`Dia de agendamento coincide com o agendamento existente: ${agendamento.dia}`);
  
          const horaInicioConsulta = new Date(`${agendamento.dia}T${consultaInicio}`);
          const horaFimConsulta = new Date(`${agendamento.dia}T${consultaFim}`);
          const horaInicioAgendamento = new Date(`${agendamento.dia}T${horaInicio}`);
          const horaFimAgendamento = new Date(`${agendamento.dia}T${horaFim}`);
  
          console.log(`Agendamento sendo verificado: Início: ${horaInicioAgendamento}, Fim: ${horaFimAgendamento}`);
          console.log(`Horários do agendamento existente: Início: ${horaInicioConsulta}, Fim: ${horaFimConsulta}`);
  
          // Verificação de sobreposição entre os horários
          if (
            (horaInicioAgendamento < horaFimConsulta && horaInicioAgendamento >= horaInicioConsulta) || // O início do novo horário está dentro de um agendamento existente
            (horaFimAgendamento > horaInicioConsulta && horaFimAgendamento <= horaFimConsulta) || // O fim do novo horário está dentro de um agendamento existente
            (horaInicioAgendamento <= horaInicioConsulta && horaFimAgendamento >= horaFimConsulta) // O novo horário envolve totalmente o horário de outro agendamento
          ) {
            console.log('Conflito de horário encontrado!');
            return true; // Conflito encontrado
          } else {
            console.log('Nenhum conflito encontrado para este agendamento.');
          }
        } else {
          console.log(`O dia de agendamento ${agendamento.dia} não coincide com o dia do agendamento existente ${consultaDia}.`);
        }
      }
    }
  
    console.log('Nenhum conflito de horário encontrado após verificar todos os agendamentos.');
    return false; // Nenhum conflito
  };
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setAgendamento({
      ...agendamento,
      [name]: value,
    });
  };

  const handleEditAgendamento = async (e) => {
    e.preventDefault();

    if (!agendamento.paciente || !agendamento.descricao || !agendamento.data || !agendamento.horaInicio || !agendamento.horaFim) {
      alert("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    if (agendamento.horaFim <= agendamento.horaInicio) {
      alert('A hora de fim deve ser maior que a hora de início.');
      return;
    }

    console.log("agendamento quandio clica no botao: ", agendamento)

    if (!isDataDisponivel(agendamento.dia)) {
      return;
    }

    const diaSemana = getDiaDaSemana(agendamento.dia);
    const horariosDia = diasDisponiveis.find((dia) => dia.diaSemana === diaSemana);
    const horaInicioDia = horariosDia.horaInicio;
    const horaFimDia = horariosDia.horaFim;

    if (!verificarHoraValida(agendamento.horaInicio, diaSemana) || !verificarHoraValida(agendamento.horaFim, diaSemana)) {
      alert(`As horas selecionadas não são válidas. No dia ${diaSemana}, os horários disponíveis são entre ${horaInicioDia} e ${horaFimDia}.`);
      return;
    }

    if (verificarConflitoHorario(agendamento.horaInicio, agendamento.horaFim)) {
      alert('O horário selecionado conflita com outra consulta já marcada para esse profissional.');
      return;
    }

    try {
      console.log("Agendamento enviado para o back: ", agendamento);
      const response = await Axios.put(API_URL + pid, agendamento);

      setMessage({ message: 'Agendamento atualizado com sucesso!', status: 'ok' });
    } catch (error) {
      console.error('Erro ao atualizar o agendamento:', error);
      setMessage({ message: 'Erro ao atualizar o agendamento!', status: 'error' });
    }
  };

  return (
    <>
            <NavAdmin />
            <MenuUsers />
      <div className="d-flex justify-content-center p-4" style={{ backgroundColor: "#f7f7f7", minHeight: "100vh" }}>
        <div className="container">
          <div className="row mb-4 pb-3" style={{ borderBottom: "1px solid #a0a0a0" }}>
            <h3 className="text-success">Edição de Agendamento</h3>
          </div>
  
          <form method="POST" id="formAgendamento" onSubmit={handleEditAgendamento}>
            {/* Paciente */}
            <div className="mb-3">
              <label htmlFor="paciente" className="form-label">Paciente:</label>
              <select
                id="paciente"
                name="paciente"
                className="form-select"
                value={agendamento.paciente}
                onChange={handleChange}
                required
              >
                <option value="" disabled>-- Selecione --</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.idPacientes} value={paciente.idPacientes}>
                    {paciente.primeiroNome} {paciente.ultimoNome}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Descrição */}
            <div className="mb-3">
              <label htmlFor="descricao" className="form-label">Descrição:</label>
              <textarea
                id="descricao"
                name="descricao"
                className="form-control"
                rows="3"
                value={agendamento.descricao}
                onChange={handleChange}
                required
              />
            </div>
  
            {/* Data do Agendamento */}
            <div className="mb-3">
              <label htmlFor="data" className="form-label">Data do Agendamento:</label>
              <input
                type="date"
                id="dia"
                name="dia"
                className="form-control"
                value={agendamento.dia ? agendamento.dia.split("T")[0] : ""}
                onChange={handleChange}
                min={todayDate}
                required
              />
            </div>
  
            {/* Hora de Início */}
            <div className="mb-3">
              <label htmlFor="horaInicio" className="form-label">Hora de Início:</label>
              <input
                type="time"
                id="horaInicio"
                name="horaInicio"
                className="form-control"
                value={agendamento.horaInicio}
                onChange={handleChange}
                required
              />
            </div>
  
            {/* Hora de Fim */}
            <div className="mb-3">
              <label htmlFor="horaFim" className="form-label">Hora de Fim:</label>
              <input
                type="time"
                id="horaFim"
                name="horaFim"
                className="form-control"
                value={agendamento.horaFim}
                onChange={handleChange}
                required
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
              <button type="submit" className="btn btn-success me-2">Salvar Agendamento</button>
              <Link className="btn btn-outline-info" href={pid ? `/admin/agendamentos/index/${agendamento.profissional}` : "#"}>
                Voltar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );  
}
