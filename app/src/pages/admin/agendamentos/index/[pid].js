import Axios from 'axios'
import NavAdmin from '@/components/NavAdmin'
import AppointmentAction from '@/components/AppointmentAction'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import MenuUsers from '@/components/MenuUsers'
import { useRouter } from 'next/router';

export default function agendamentos() {

  const API_URL = "http://localhost:8080/api/agendamentos/idProfissionais/"  // URL de agendamentos
  const router = useRouter();
  const { pid } = router.query;

  const [agendamentos, setAgendamentos] = useState([]); 

  useEffect(() => {
    const getAllAgendamentos = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setAgendamentos(response.data);
        console.log(response.data);
        
      } catch (error) {
        console.error('Erro ao buscar os agendamentos:', error);
      }
    };

    getAllAgendamentos();
  }, [pid]);  // Adicionando o pid como dependência para recarregar quando mudar

  return (
    <>
      <Head>
        <title>APP-BC</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div>
        <NavAdmin />
        <MenuUsers />
      </div>
  
      <div className="d-flex justify-content-center p-4" style={{ background: 'linear-gradient(45deg, #ffffff, #d4edda)',  minHeight: '100vh'}}>
        <div className="container">
          <div className="row mb-4 pb-3" style={{ borderBottom: '1px solid #a0a0a0' }}>
            <h3 className="text-success">Lista de Agendamentos</h3>
          </div>
  
          <div className="d-flex justify-content-center mb-4">
            <Link className="nav-link" href={`/admin/agendamentos/create/${pid}`}>
              <button className="btn btn-success btn-lg p-3">Cadastrar Agendamento</button>
            </Link>
          </div>
  
          <div className="d-flex justify-content-center mb-4">
            <Link className="nav-link" href={`/admin/agendamentos/indexAntigo/${pid}`}>
              <button className="btn btn-success btn-lg p-3">Visualizar Agendamentos Passados</button>
            </Link>
          </div>
  
          {agendamentos.length === 0 ? (
            <div className="text-center">
              <p className="text-danger"><strong>Não há agendamentos para este profissional ainda.</strong></p>
              <p>Você pode cadastrar novos agendamentos clicando no botão acima.</p>
            </div>
          ) : (
            <div className="row">
              {agendamentos.map(agendamento => {
                const dataFormatada = new Date(agendamento.dia).toLocaleDateString('pt-BR');
  
                return (
                  <div key={agendamento.idAgendamentos} className="col-md-4 mb-4" id={`agendamento-${agendamento.idAgendamentos}`}>
                    <div className="card shadow-lg border-success">
                      <div className="card-body">
                        <h5 className="card-title text-success">Agendamento de {agendamento.primPr} {agendamento.ultPr}</h5>
                        <p className="card-text"><strong>Paciente:</strong> {agendamento.primPac} {agendamento.ultPac}</p>
                        <p className="card-text"><strong>Data:</strong> {dataFormatada}</p>
                        <p className="card-text"><strong>Hora Início:</strong> {agendamento.horaInicio}</p>
                        <p className="card-text"><strong>Hora Fim:</strong> {agendamento.horaFim}</p>
                        <p className="card-text"><strong>Descrição:</strong> {agendamento.descricao}</p>
                        <div className="d-flex justify-content-end">
                          <AppointmentAction pid={agendamento.idAgendamentos} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );  
}