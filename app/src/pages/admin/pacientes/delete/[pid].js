import Axios from 'axios';

const API_URL = "http://localhost:8080/api/pacientes/id/";

export default async function handleDeletePaciente(pid) {

  const confirmed = window.confirm('Tem certeza de que deseja deletar este paciente?');
  if (!confirmed) {
    return; // Se o usuário cancelar, não faz nada
  }

  try {
    const response = await Axios.delete(API_URL + pid);

        // Encontre o card com o data-id correspondente ao id do paciente deletado
        const pacienteCardContainer = document.getElementById(`paciente-${pid}`);

        // Se o card for encontrado, remova-o do DOM
        if (pacienteCardContainer) {
          pacienteCardContainer.remove();
          document.body.offsetHeight
        }

    alert('Paciente deletado com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar o Paciente:', error);
    alert('Erro ao deletar o paciente');
  }
  

}