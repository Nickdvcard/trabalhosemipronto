import Axios from 'axios';

const API_URL = "http://localhost:8080/api/profissoes/id/";

export default async function handleDeleteProfissao(pid) {
  const confirmed = window.confirm('Tem certeza de que deseja deletar esta profissão?');
  if (!confirmed) {
    return; // Se o usuário cancelar, não faz nada
  }

  try {
    // Verifica se a profissão está associada a algum profissional
    const checkResponse = await Axios.get("http://localhost:8080/api/profissoes/check/" + pid);
    if (checkResponse.data.isLinked) {
      alert('Não é possível deletar esta profissão, pois ela está associada a um ou mais profissionais.');
      return;
    }

    const response = await Axios.delete(API_URL + pid);

    const profissaoCardContainer = document.getElementById(`profissao-${pid}`);

    if (profissaoCardContainer) {
      profissaoCardContainer.remove();
      document.body.offsetHeight; 
    }

    alert('Profissão deletada com sucesso!');
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    alert('Erro ao processar a requisição.');
  }
}
