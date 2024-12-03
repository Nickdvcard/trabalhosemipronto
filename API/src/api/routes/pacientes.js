const express = require('express');
const router = express.Router();
const pool = require('../../../src/conexao');

// Rota para obter a lista de endereços
router.get('/enderecos', (req, res) => {
    const query = 'SELECT idEnderecos, logradouro, numero FROM enderecos';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao obter endereços:', err);
            res.status(500).json({ error: 'Erro ao obter endereços' });
        } else {
            res.json(results);
        }
    });
});

router.get('/pedagogos', (req, res) => {
    const query = 'SELECT idProfissionais, primeiroNome, ultimoNome FROM bancoapae6.profissionais AS p INNER JOIN profissoes_profissionais AS pp ON p.idProfissionais = pp.Profissionais_id_FK WHERE pp.pedagogo = 1';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao obter profissionais:', err);
            res.status(500).json({ error: 'Erro ao obter endereços' });
        } else {
            res.json(results);
        }
    });
});

router.get('/condicoes', (req, res) => {
    const query = 'SELECT idCondicoes, nome FROM bancoapae6.condicoes ';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao obter condicoes:', err);
            res.status(500).json({ error: 'Erro ao obter endereços' });
        } else {
            res.json(results);
        }
    });
});


router.get('/ufs', (req, res) => {
    const query ='SELECT idUFs, nome FROM ufs';
    pool.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar estados' });
        }
        res.json(results);
    });
});


router.get('/cidades', (req, res) => {
    const query = 'SELECT idCidades, nome, UFs_id_FK AS uf_cidade FROM cidades'; 
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao buscar cidades:', error);
            return res.status(500).json({ error: 'Erro ao buscar cidades' });
        }
        res.json(results); // Retorna os resultados como JSON
    });
});

router.get('/bairros', (req, res) => {
    const query = 'SELECT idBairros, nome, Cidades_id_FK AS cidade_bairro FROM bairros'; // Substitua pela sua consulta
    pool.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: 'Erro ao carregar bairros' });
        res.json(results);
    });
});

router.post('/', async (req, res) => {
    const {
        first_name,
        last_name,
        observations,
        teacher,
        condition,
        logradouro,
        numero,
        complemento,
        cep,
        uf,
        cidade,
        bairro
    } = req.body;

    try {
        console.log('Dados recebidos:', req.body);

        // Insere endereço
        const enderecoQuery = `
            INSERT INTO enderecos (logradouro, numero, complemento, CEP, Bairros_id_FK)
            VALUES (?, ?, ?, ?, ?)
        `;
        const enderecoResult = await pool.promise().query(enderecoQuery, [
            logradouro,
            numero,
            complemento,
            cep,
            bairro
        ]);

        const enderecoId = enderecoResult[0].insertId;

        // Insere paciente
        const pacienteQuery = `
            INSERT INTO pacientes (primeiroNome, ultimoNome, observacoes, Condicoes_id_FK, Enderecos_id_FK, Profissionais_id_FK)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const pacienteResult = await pool.promise().query(pacienteQuery, [
            first_name,
            last_name,
            observations,
            condition,
            enderecoId,
            teacher
        ]);

        // Responde ao cliente
        res.status(200).json({ message: 'Paciente cadastrado com sucesso.' });

    } catch (error) {
        console.error('Erro ao cadastrar paciente:', error);
        res.status(500).json({ error: 'Erro ao cadastrar paciente.' });
    }
});

router.get('/', (req, res) => {
    const query = `SELECT p.idPacientes, p.primeiroNome, p.ultimoNome, p.observacoes, 
	   e.logradouro, e.numero, e.complemento, e.CEP, cond.nome AS condicao, profissional.primeiroNome AS profNome,
       profissional.ultimoNome AS profSobrenome,
       b.nome AS bairro, c.nome AS cidade, u.nome AS estado
       FROM pacientes AS p
       INNER JOIN condicoes AS cond
       ON p.Condicoes_id_FK = cond.IdCondicoes
       INNER JOIN profissionais AS profissional
       ON p.Profissionais_id_FK = profissional.idProfissionais
       INNER JOIN enderecos AS e
       ON p.Enderecos_id_FK = e.IdEnderecos
       INNER JOIN bairros AS b
       ON e.Bairros_id_FK = b.IdBairros
       INNER JOIN cidades AS c
       ON b.Cidades_id_FK = c.IdCidades
       INNER JOIN UFs AS u
       ON c.UFs_id_FK = u.IdUFs
       ORDER BY p.primeiroNome ASC`;
    
    pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar pacientes' });
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.get('/id/:id', (req, res) => {
    const pacienteId = req.params.id;

    const query = `SELECT p.idPacientes, p.primeiroNome, p.ultimoNome, p.observacoes, 
	   e.logradouro, e.numero, e.complemento, e.CEP AS cep, cond.nome AS condicao, profissional.primeiroNome AS profNome,
       profissional.ultimoNome AS profSobrenome,
       b.nome AS bairro, c.nome AS cidade, u.nome AS estado
       FROM pacientes AS p
       INNER JOIN condicoes AS cond
       ON p.Condicoes_id_FK = cond.IdCondicoes
       INNER JOIN profissionais AS profissional
       ON p.Profissionais_id_FK = profissional.idProfissionais
       INNER JOIN enderecos AS e
       ON p.Enderecos_id_FK = e.IdEnderecos
       INNER JOIN bairros AS b
       ON e.Bairros_id_FK = b.IdBairros
       INNER JOIN cidades AS c
       ON b.Cidades_id_FK = c.IdCidades
       INNER JOIN UFs AS u
       ON c.UFs_id_FK = u.IdUFs
       WHERE p.idPacientes = ?
       ORDER BY p.primeiroNome ASC`;
    
    pool.query(query, [pacienteId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao carregar pacientes' });
        }
        
        res.json(results); // Retorna dados para o front-end
    });
});

router.delete('/id/:id', (req, res) => {
    const pacienteId = req.params.id;


    // Primeiro, obtenha o ID do endereço associado ao paciente
    const enderecoIdQuery = 'SELECT Enderecos_id_FK FROM pacientes WHERE idPacientes = ?';

    pool.query(enderecoIdQuery, [pacienteId], (error, result) => {
        if (error) {
            console.error("Erro ao buscar ID do endereço:", error);
            return res.status(500).json({ error: 'Erro ao buscar ID do endereço' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        const enderecoId = result[0].Enderecos_id_FK;

        // Deletar o paciente primeiro
        const deletePacienteQuery = 'DELETE FROM pacientes WHERE idPacientes = ?';

        pool.query(deletePacienteQuery, [pacienteId], (error, result) => {
            if (error) {
                console.error("Erro ao deletar paciente:", error);
                return res.status(500).json({ error: 'Erro ao deletar paciente' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }

            // Em seguida, deletar o endereço associado ao paciente
            const deleteEnderecoQuery = 'DELETE FROM enderecos WHERE idEnderecos = ?';

            pool.query(deleteEnderecoQuery, [enderecoId], (error) => {
                if (error) {
                    console.error("Erro ao deletar endereço:", error);
                    return res.status(500).json({ error: 'Erro ao deletar endereço' });
                }

                res.status(200).json({ message: 'Paciente e endereço deletados com sucesso!' });
            });
        });
    });
});

router.put('/id/:id', (req, res) => {
    // Log para verificar o corpo da requisição
    console.log('Dados recebidos no corpo da requisição (req.body):', req.body);

    const {
        primeiroNome,
        ultimoNome,
        observacoes,
        teacher,
        condition,
        logradouro,
        numero,
        complemento,
        cep,
        uf,
        cidade,
        bairro
    } = req.body;

    const patientId = req.params.id; // Usando o ID passado no parâmetro

    // Primeiro, busque o Enderecos_id_FK relacionado ao paciente
    const buscaEnderecoQuery = `
        SELECT Enderecos_id_FK 
        FROM pacientes 
        WHERE idPacientes = ?
    `;

    pool.query(buscaEnderecoQuery, [patientId], (buscaErr, results) => {
        if (buscaErr) {
            console.error('Erro ao buscar endereço do paciente:', buscaErr);
            return res.status(500).json({ message: 'Erro ao buscar endereço do paciente.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Paciente não encontrado.' });
        }

        const enderecoId = results[0].Enderecos_id_FK;

        // Atualiza os dados do paciente
        const pacienteQuery = `
            UPDATE pacientes 
            SET primeiroNome = ?, ultimoNome = ?, observacoes = ?, Profissionais_id_FK = ?, Condicoes_id_FK = ? 
            WHERE idPacientes = ?
        `;

        pool.query(
            pacienteQuery,
            [primeiroNome, ultimoNome, observacoes, teacher, condition, patientId],
            (pacienteErr) => {
                if (pacienteErr) {
                    console.error('Erro ao atualizar paciente:', pacienteErr);
                    return res.status(500).json({ message: 'Erro ao atualizar paciente.' });
                }

                // Atualiza os dados do endereço
                const enderecoQuery = `
                    UPDATE enderecos 
                    SET logradouro = ?, numero = ?, complemento = ?, CEP = ?, Bairros_id_FK = ? 
                    WHERE idEnderecos = ?
                `;
                pool.query(
                    enderecoQuery,
                    [logradouro, numero, complemento, cep, bairro, enderecoId],
                    (enderecoErr) => {
                        if (enderecoErr) {
                            console.error('Erro ao atualizar endereço:', enderecoErr);
                            return res.status(500).json({ message: 'Erro ao atualizar endereço.' });
                        }

                        // Responde ao cliente com sucesso
                        res.status(200).json({ message: 'Dados do paciente e endereço atualizados com sucesso.' });
                    }
                );
            }
        );
    });
});



module.exports = router;

    
