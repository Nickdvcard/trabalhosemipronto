import Axios from 'axios';

const API_URL = "http://localhost:8080/api/condicoes/id/";

export default async function handleDeleteCondicao(pid) {
  const confirmed = window.confirm('Tem certeza de que deseja deletar esta condição?');
  if (!confirmed) {
    return; // Se o usuário cancelar, não faz nada
  }

  try {
    // Verifica se a condiçãp está associada a algum paciente
    const checkResponse = await Axios.get("http://localhost:8080/api/condicoes/check/" + pid);
    if (checkResponse.data.isLinked) {
      alert('Não é possível deletar esta condição, pois ela está associada a um ou mais pacientes.');
      return;
    }

    const response = await Axios.delete(API_URL + pid);

    const condicaoCardContainer = document.getElementById(`condicao-${pid}`);

    if (condicaoCardContainer) {
      condicaoCardContainer.remove();
      document.body.offsetHeight; 
    }

    alert('Condição deletada com sucesso!');
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    alert('Erro ao processar a requisição.');
  }
}
