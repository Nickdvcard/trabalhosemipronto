const express = require('express');
const router = express.Router();
const pool = require('../../../src/conexao');

router.get('/idProfissionais/:id', (req, res) => {
    const profissionalId = req.params.id || 0

    //console.log(profissionalId)

    const query = `SELECT ag.idAgendamentos, ag.data AS dia, ag.horaInicio, ag.horaFim, ag.descricao,
	   pr.primeiroNome AS primPr, pr.ultimoNome AS ultPr, pac.primeiroNome AS primPac, pac.ultimoNome AS ultPac
	   FROM bancoapae6.agendamentos AS ag
       INNER JOIN profissionais AS pr
       ON ag.Profissionais_id_FK = pr.idProfissionais
	   INNER JOIN pacientes AS pac
       ON ag.Pacientes_id_FK = pac.idPacientes
       WHERE ag.Profissionais_id_FK = ?
       AND ag.data >= CURDATE()
       ORDER BY ag.data ASC, 
       ag.horaInicio ASC;`;
    
    pool.query(query, [profissionalId], (error, results) => {

        //console.log(results);

        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar agendamentos' });
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.get('/idProfissionais/antigo/:id', (req, res) => {
    const profissionalId = req.params.id || 0

    //console.log(profissionalId)

    const query = `SELECT ag.idAgendamentos, ag.data AS dia, ag.horaInicio, ag.horaFim, ag.descricao,
	   pr.primeiroNome AS primPr, pr.ultimoNome AS ultPr, pac.primeiroNome AS primPac, pac.ultimoNome AS ultPac
	   FROM bancoapae6.agendamentos AS ag
       INNER JOIN profissionais AS pr
       ON ag.Profissionais_id_FK = pr.idProfissionais
	   INNER JOIN pacientes AS pac
       ON ag.Pacientes_id_FK = pac.idPacientes
       WHERE ag.Profissionais_id_FK = ?
       AND ag.data < CURDATE()
       ORDER BY ag.data ASC, 
       ag.horaInicio ASC;`;
    
    pool.query(query, [profissionalId], (error, results) => {

        //console.log(results);

        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar agendamentos' });
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});


router.get('/pacientes', (req, res) => {

    const query = `SELECT idPacientes, primeiroNome, ultimoNome FROM pacientes;`;
    
    pool.query(query, (error, results) => {

        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar pacientes' });
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.get('/horarios/:id', (req, res) => {
    const profissionalId = req.params.id

    const query = `SELECT diaSemana, horaInicio, horaFim FROM horariostrabalho WHERE Profissionais_id_FK = ?;`;
    
    pool.query(query, [profissionalId], (error, results) => {

        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar pacientes' });
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.post('/', async (req, res) => {
    const {
        data,
        horaInicio,
        horaFim,
        descricao,
        profissional,
        paciente,
        mesesRetorno
    } = req.body;

    try {
        console.log('Dados recebidos:', req.body);

        // Insere o primeiro agendamento
        const agendamentoQuery = `
            INSERT INTO agendamentos (data, horaInicio, horaFim, descricao, Profissionais_id_FK, Pacientes_id_FK)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await pool.promise().query(agendamentoQuery, [
            data,
            horaInicio,
            horaFim,
            descricao,
            profissional,
            paciente
        ]);

        // Verifica se mesesRetorno foi informado
        if (mesesRetorno) {
            const semanas = mesesRetorno * 4; // Calcula o número de semanas
            const consultas = [];

            // Gera consultas adicionais
            for (let i = 1; i <= semanas; i++) {
                const novaData = new Date(data);
                novaData.setDate(novaData.getDate() + i * 7); // Incrementa semanas
                const novaDataFormatada = novaData.toISOString().split('T')[0]; // Data no formato YYYY-MM-DD

                // Ignora datas entre 20/12 e 10/01
                const mes = novaData.getMonth() + 1; // Mês (0-indexado)
                const dia = novaData.getDate();
                if ((mes === 12 && dia >= 20) || (mes === 1 && dia <= 10)) {
                    continue; // Pula para a próxima iteração
                }

                // Verifica conflitos com agendamentos existentes
                const conflitoQuery = `
                    SELECT COUNT(*) AS conflito
                    FROM agendamentos
                    WHERE Profissionais_id_FK = ?
                    AND data = ? 
                    AND (
                        (horaInicio < ? AND horaFim > ?) OR -- Novo horário conflita com agendamento existente
                        (horaInicio < ? AND horaFim > ?)  -- Novo horário conflita com agendamento existente
                    )
                `;
                const [conflitoResult] = await pool
                    .promise()
                    .query(conflitoQuery, [
                        profissional,
                        novaDataFormatada,
                        horaFim,
                        horaInicio,
                        horaInicio,
                        horaFim
                    ]);

                if (conflitoResult[0].conflito > 0) {
                    // Se houver conflito, aborta o processo e envia erro para o frontend
                    return res.json({
                        success: false,
                        message: "Plano de agendamentos não pode ser realizado. Conflito de horário encontrado."
                    });
                }

                // Adiciona consulta válida à lista
                consultas.push([ 
                    novaDataFormatada,
                    horaInicio,
                    horaFim,
                    descricao,
                    profissional,
                    paciente
                ]);
            }

            // Insere as consultas adicionais válidas
            if (consultas.length > 0) {
                const consultasQuery = `
                    INSERT INTO agendamentos (data, horaInicio, horaFim, descricao, Profissionais_id_FK, Pacientes_id_FK)
                    VALUES ?
                `;
                await pool.promise().query(consultasQuery, [consultas]);
            }
        }

        res.status(200).json({ message: 'Agendamento(s) criado(s) com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro ao criar agendamento.' });
    }
});

router.delete('/id/:id', (req, res) => {
    const agendamentoId = req.params.id;

    // Deletar o agendamento pelo ID
    const deleteAgendamentoQuery = 'DELETE FROM agendamentos WHERE idAgendamentos = ?';

    pool.query(deleteAgendamentoQuery, [agendamentoId], (error, result) => {
         if (error) {
             console.error("Erro ao deletar agendamento:", error);
            return res.status(500).json({ error: 'Erro ao deletar agendamento' });
        }

        res.status(200).json({ message: 'Agendamento deletado com sucesso!' });
    });
});

router.get('/id/:id', (req, res) => {
    const agendamentoId = req.params.id

    //console.log(profissionalId)

    const query = `SELECT ag.idAgendamentos, ag.data AS dia, ag.horaInicio, ag.horaFim, ag.descricao,
	   pr.primeiroNome AS primPr, pr.ultimoNome AS ultPr, pac.primeiroNome AS primPac, pac.ultimoNome AS ultPac,
       pr.idProfissionais AS profissional, pac.idPacientes AS paciente
	   FROM bancoapae6.agendamentos AS ag
       INNER JOIN profissionais AS pr
       ON ag.Profissionais_id_FK = pr.idProfissionais
	   INNER JOIN pacientes AS pac
       ON ag.Pacientes_id_FK = pac.idPacientes
       WHERE ag.idAgendamentos = ?;`;
    
    pool.query(query, [agendamentoId], (error, results) => {

        //console.log(results);

        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar agendamentos' });
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.put('/id/:id', async (req, res) => {
    const agendamentoId = req.params.id;

    const {
        dia,
        horaInicio,
        horaFim,
        descricao,
        profissional,
        paciente
    } = req.body;

    try {
        console.log('Dados recebidos para atualização:', req.body);

        // Atualiza o agendamento no banco de dados
        const agendamentoQuery = `
            UPDATE agendamentos
            SET 
                data = ?,
                horaInicio = ?,
                horaFim = ?,
                descricao = ?,
                Profissionais_id_FK = ?,
                Pacientes_id_FK = ?
            WHERE idAgendamentos = ?
        `;
        
        // Realizando a consulta para atualizar o agendamento
        await pool.promise().query(agendamentoQuery, [
            dia, // Data do agendamento
            horaInicio, // Hora de início
            horaFim, // Hora de fim
            descricao, // Nova descrição
            profissional, // ID do profissional
            paciente, // ID do paciente
            agendamentoId // ID do agendamento a ser atualizado
        ]);

        // Retorna uma resposta de sucesso
        res.status(200).json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar o agendamento:', error);
        res.status(500).json({ message: 'Erro ao atualizar o agendamento', error: error.message });
    }
});



module.exports = router;