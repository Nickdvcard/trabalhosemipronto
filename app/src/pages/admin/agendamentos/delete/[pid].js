import Axios from 'axios';

const API_URL = "http://localhost:8080/api/agendamentos/id/";

export default async function handleDeleteAgendamento(pid) {

  const confirmed = window.confirm('Tem certeza de que deseja deletar este agendamento?');
  if (!confirmed) {
    return; // Se o usuário cancelar, não faz nada
  }

  try {
    const response = await Axios.delete(API_URL + pid);

        // Encontre o card com o data-id correspondente ao id do agendamento deletado
        const agendamentoCardContainer = document.getElementById(`agendamento-${pid}`);

        // Se o card for encontrado, remova-o do DOM
        if (agendamentoCardContainer) {
          agendamentoCardContainer.remove();
          document.body.offsetHeight
        }

    alert('Agendamento deletado com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar o agendamento:', error);
    alert('Erro ao deletar o agendamento');
  }
  

}