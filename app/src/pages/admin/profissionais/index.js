import Axios from 'axios'
import NavAdmin from '@/components/NavAdmin'
import ProfessionalAction from '@/components/ProfessionalAction'  // Ajuste o nome do componente de ação
import Head from 'next/head'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import MenuUsers from '@/components/MenuUsers'

export default function idProfissional() {

  const API_URL = "http://localhost:8080/api/profissionais"  // URL de profissionais
  
  const [profissionais, setProfissionais] = useState([]); 
  
  useEffect(() => {
    const getAllProfissionais = async () => {
      try {
        const response = await Axios.get(API_URL);
        setProfissionais(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Erro ao buscar os profissionais:', error);
      }
    };

    getAllProfissionais();

  }, []);

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
  
      <div className="d-flex justify-content-center p-4" style={{ background: 'linear-gradient(45deg, #ffffff, #d4edda)' }}>
        <div className="container">
          <div className="row mb-4 pb-3" style={{ borderBottom: '1px solid #a0a0a0' }}>
            <h3 className="text-success">Lista de Profissionais</h3>
          </div>
  
          <div className="d-flex justify-content-center mb-4">
            <Link className="nav-link" href="/admin/profissionais/create">
              <button className="btn btn-success btn-lg p-3">Cadastrar</button>
            </Link>
          </div>
  
          <div className="row">
            {profissionais.map(profissional => (
              <div key={profissional.idProfissionais} className="col-md-4 mb-4" id={`profissional-${profissional.idProfissionais}`}>
                <div className="card shadow-lg border-success">
                  <div className="card-body">
                    <h5 className="card-title text-success">{profissional.primeiroNome} {profissional.ultimoNome}</h5>
                    <p className="card-text"><strong>Pedagogo?:</strong> {profissional.pedagogo === 1 ? 'Sim' : 'Não'}</p>
                    <p className="card-text"><strong>Profissão:</strong> {profissional.profissao}</p>
                    <p className="card-text"><strong>Descrição:</strong> {profissional.descricao}</p>
                    <p className="card-text"><strong>Horários:</strong></p>
                    <ul className="ps-3">
                      {profissional.horarios.split(";").map((horario, index) => (
                        <li key={index}>{horario.trim()}</li>
                      ))}
                    </ul>
                    <div className="d-flex justify-content-end">
                      <ProfessionalAction pid={profissional.idProfissionais} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );  
}