import Axios from 'axios';

const API_URL = "http://localhost:8080/api/profissionais/id/";

export default async function handleDeleteProfissional(pid) {

  const confirmed = window.confirm('Tem certeza de que deseja deletar este profissional?');
  if (!confirmed) {
    return; // Se o usuário cancelar, não faz nada
  }

  try {
    const response = await Axios.delete(API_URL + pid);

        // Encontre o card com o data-id correspondente ao id do paciente deletado
        const profissionalCardContainer = document.getElementById(`profissional-${pid}`);

        // Se o card for encontrado, remova-o do DOM
        if (profissionalCardContainer) {
          profissionalCardContainer.remove();
          document.body.offsetHeight
        }

    alert('Profissional deletado com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar o profissional:', error);
    alert('Erro ao deletar o profissional');
  }
  

}