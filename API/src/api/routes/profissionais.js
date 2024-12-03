const express = require('express');
const router = express.Router();
const pool = require('../../../src/conexao');

router.get('/', (req, res) => {
    const query = `SELECT pr.idProfissionais, pr.primeiroNome, pr.ultimoNome,
	   pp.pedagogo, pro.nome AS profissao, pro.descricao AS descricao, 
       GROUP_CONCAT(CONCAT(ht.horaInicio, '-', ht.horaFim, ' (', ht.diaSemana, ')') SEPARATOR '; ') AS horarios
       FROM bancoapae6.profissionais AS pr
       INNER JOIN profissoes_profissionais AS pp
       ON pr.idProfissionais = pp.Profissionais_id_FK
       INNER JOIN profissoes AS pro
       ON pp.Profissoes_id_FK = pro.idProfissoes
       INNER JOIN horariostrabalho AS ht
       ON pr.idProfissionais = ht.Profissionais_id_FK
       GROUP BY 
       pr.idProfissionais, 
       pr.primeiroNome, 
       pr.ultimoNome,
       pp.pedagogo, 
       pro.nome, 
       pro.descricao
	   ORDER BY 
       pr.primeiroNome ASC;`;
    
    pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar profissionais'});
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.get('/id/:id', (req, res) => {
    const profissionalId = req.params.id;

    const query = `SELECT pr.idProfissionais, pr.primeiroNome, pr.ultimoNome,
	   pp.pedagogo, pro.idProfissoes AS profissao, pro.descricao AS descricao, 
       GROUP_CONCAT(CONCAT(ht.horaInicio, '-', ht.horaFim, ', ', ht.diaSemana) SEPARATOR '; ') AS horarios  
       FROM bancoapae6.profissionais AS pr 
       INNER JOIN profissoes_profissionais AS pp
       ON pr.idProfissionais = pp.Profissionais_id_FK
       INNER JOIN profissoes AS pro
       ON pp.Profissoes_id_FK = pro.idProfissoes
       INNER JOIN horariostrabalho AS ht
       ON pr.idProfissionais = ht.Profissionais_id_FK
       WHERE idProfissionais = ?
       GROUP BY 
       pr.idProfissionais, 
       pr.primeiroNome, 
       pr.ultimoNome,
       pp.pedagogo, 
       pro.idProfissoes, 
       pro.descricao;`;
    
    pool.query(query, [profissionalId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar profissionais'});
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.get('/profissoes', (req, res) => {
    const query = 'SELECT idProfissoes, nome FROM bancoapae6.profissoes';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao obter profissionais:', err);
            res.status(500).json({ error: 'Erro ao obter endereços' });
        } else {
            res.json(results);
        }
    });
});

router.post('/', async (req, res) => {
    const {
        primeiroNome,
        ultimoNome,
        pedagogo,
        profissao,
        horarios
    } = req.body;

    try {
        console.log('Dados recebidos:', req.body);

        // Insere profissionais
        const profissionalQuery = `
            INSERT INTO profissionais (primeiroNome, ultimoNome)
            VALUES (?, ?)
        `;
        const profissionalResult = await pool.promise().query(profissionalQuery, [
            primeiroNome,
            ultimoNome
        ]);

        const profissionalId = profissionalResult[0].insertId;

        // Insere profissoes_profissionais
        const profissoes_profissionaisQuery = `
            INSERT INTO profissoes_profissionais (Profissionais_id_FK, Profissoes_id_FK, pedagogo) 
            VALUES (?, ?, ?);
        `;
        const profissoes_profissionaisResult = await pool.promise().query(profissoes_profissionaisQuery, [
            profissionalId,
            profissao,
            pedagogo
        ]);

      // Processa os horários
      const periodos = horarios.split(';').map(periodo => periodo.trim());

      for (const periodo of periodos) {
          const [horas, diaSemana] = periodo.split(',').map(p => p.trim());
          const [horaInicio, horaFim] = horas.split('-').map(h => h.trim());

          // Insere cada período no banco
          const horarioTrabalhoQuery = `
              INSERT INTO horariostrabalho (diaSemana, horaInicio, horaFim, Profissionais_id_FK)
              VALUES (?, ?, ?, ?)
          `;
          await pool.promise().query(horarioTrabalhoQuery, [
              diaSemana,
              horaInicio,
              horaFim,
              profissionalId
          ]);
      }

        // Responde ao cliente
        res.status(200).json({ message: 'Profissional cadastrado com sucesso.' });

    } catch (error) {
        console.error('Erro ao cadastrar profissional:', error);
        res.status(500).json({ error: 'Erro ao cadastrar profissional.' });
    }
});

router.delete('/id/:id', (req, res) => {
    const profissionalId = req.params.id;

    // Primeiro, deletar os horários de trabalho associados ao profissional
    const deleteHorariosQuery = 'DELETE FROM horariostrabalho WHERE Profissionais_id_FK = ?';

    pool.query(deleteHorariosQuery, [profissionalId], (error, result) => {
        if (error) {
            console.error("Erro ao deletar horários de trabalho:", error);
            return res.status(500).json({ error: 'Erro ao deletar horários de trabalho' });
        }

        // Em seguida, deletar os registros na tabela profissoes_profissionais associados ao profissional
        const deleteProfissoesQuery = 'DELETE FROM profissoes_profissionais WHERE Profissionais_id_FK = ?';

        pool.query(deleteProfissoesQuery, [profissionalId], (error, result) => {
            if (error) {
                console.error("Erro ao deletar registros em profissoes_profissionais:", error);
                return res.status(500).json({ error: 'Erro ao deletar registros em profissoes_profissionais' });
            }

            // Agora, deletar os registros da tabela agendamentos associados ao profissional
            const deleteAgendamentosQuery = 'DELETE FROM agendamentos WHERE Profissionais_id_FK = ?';

            pool.query(deleteAgendamentosQuery, [profissionalId], (error, result) => {
                if (error) {
                    console.error("Erro ao deletar agendamentos:", error);
                    return res.status(500).json({ error: 'Erro ao deletar agendamentos' });
                }

                // Por último, deletar o profissional
                const deleteProfissionalQuery = 'DELETE FROM profissionais WHERE idProfissionais = ?';

                pool.query(deleteProfissionalQuery, [profissionalId], (error, result) => {
                    if (error) {
                        console.error("Erro ao deletar profissional:", error);
                        return res.status(500).json({ error: 'Erro ao deletar profissional' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Profissional não encontrado' });
                    }

                    res.status(200).json({ message: 'Profissional, horários, agendamentos e registros associados deletados com sucesso!' });
                });
            });
        });
    });
});


router.put('/id/:id', async (req, res) => {
    profissionalId = req.params.id;
   
    const {
        primeiroNome,
        ultimoNome,
        pedagogo,
        profissao,
        horarios
    } = req.body;

    try {
        console.log('Dados recebidos para atualização:', req.body);

        // Atualiza os dados básicos do profissional
        const atualizarProfissionalQuery = `
            UPDATE profissionais
            SET primeiroNome = ?, ultimoNome = ?
            WHERE idProfissionais = ?
        `;
        await pool.promise().query(atualizarProfissionalQuery, [
            primeiroNome,
            ultimoNome,
            profissionalId
        ]);

        // Atualiza a relação de profissões
        const atualizarProfissoesQuery = `
            UPDATE profissoes_profissionais
            SET Profissoes_id_FK = ?, pedagogo = ?
            WHERE Profissionais_id_FK = ?
        `;
        await pool.promise().query(atualizarProfissoesQuery, [
            profissao,
            pedagogo,
            profissionalId
        ]);

        // Remove os horários antigos
        const deletarHorariosQuery = `
            DELETE FROM horariostrabalho
            WHERE Profissionais_id_FK = ?
        `;
        await pool.promise().query(deletarHorariosQuery, [profissionalId]);

        // Insere os novos horários
        const periodos = horarios.split(';').map(periodo => periodo.trim());

        for (const periodo of periodos) {
            const [horas, diaSemana] = periodo.split(',').map(p => p.trim());
            const [horaInicio, horaFim] = horas.split('-').map(h => h.trim());

            const inserirHorarioQuery = `
                INSERT INTO horariostrabalho (diaSemana, horaInicio, horaFim, Profissionais_id_FK)
                VALUES (?, ?, ?, ?)
            `;
            await pool.promise().query(inserirHorarioQuery, [
                diaSemana,
                horaInicio,
                horaFim,
                profissionalId
            ]);
        }

        // Responde ao cliente
        res.status(200).json({ message: 'Profissional atualizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao atualizar profissional:', error);
        res.status(500).json({ error: 'Erro ao atualizar profissional.' });
    }
});


module.exports = router;