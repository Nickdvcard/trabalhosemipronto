const express = require('express');
const router = express.Router();
const pool = require('../../../src/conexao');

router.get('/', (req, res) => {
    const query = 'SELECT idProfissoes as id, nome, descricao FROM bancoapae6.profissoes;';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao obter profissões:', err);
            res.status(500).json({ error: 'Erro ao obter profissões' });
        } else {
            res.json(results);
        }
    });
});

router.post('/', async (req, res) => {
    const { nome, descricao } = req.body;

    try {
        console.log('Dados recebidos:', req.body);

        // Query para inserir profissão
        const profissaoQuery = `
            INSERT INTO profissoes (nome, descricao)
            VALUES (?, ?)
        `;

        const profissaoResult = await pool.promise().query(profissaoQuery, [
            nome,
            descricao
        ]);

        // Responde ao cliente
        res.status(200).json({ message: 'Profissão cadastrada com sucesso.' });
    } catch (error) {
        console.error('Erro ao cadastrar profissão:', error);
        res.status(500).json({ error: 'Erro ao cadastrar profissão.' });
    }
});

router.delete('/id/:id', (req, res) => {
    const profissaoId = req.params.id;

    // Deletar a profissão da tabela
    const deleteProfissaoQuery = 'DELETE FROM profissoes WHERE idProfissoes = ?';

    pool.query(deleteProfissaoQuery, [profissaoId], (error, result) => {
        if (error) {
            console.error("Erro ao deletar profissão:", error);
            return res.status(500).json({ error: 'Erro ao deletar profissão' });
        }

        // Verifica se alguma linha foi afetada (se a profissão existia)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Profissão não encontrada' });
        }

        res.status(200).json({ message: 'Profissão deletada com sucesso!' });
    });
});

router.get('/check/:id', async (req, res) => {
    const profissaoId = req.params.id;

    const checkQuery = `
        SELECT COUNT(*) AS total
        FROM profissoes_profissionais
        WHERE Profissoes_id_FK = ?
    `;

    try {
        const [result] = await pool.promise().query(checkQuery, [profissaoId]);

        const isLinked = result[0].total > 0;
        res.status(200).json({ isLinked });
    } catch (error) {
        console.error('Erro ao verificar associação:', error);
        res.status(500).json({ error: 'Erro ao verificar associação.' });
    }
});

router.get('/id/:id', (req, res) => {
    const profissaoId = req.params.id;

    const getProfissaoQuery = 'SELECT * FROM profissoes WHERE idProfissoes = ?';

    pool.query(getProfissaoQuery, [profissaoId], (error, result) => {
        if (error) {
            console.error("Erro ao buscar profissão:", error);
            return res.status(500).json({ error: 'Erro ao buscar profissão' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Profissão não encontrada' });
        }

        res.status(200).json(result[0]); // Retorna apenas a profissão encontrada
    });
});

router.put('/id/:id', (req, res) => {
    const profissaoId = req.params.id;
    const { nome, descricao } = req.body;

    // Verifica se os campos estão presentes
    if (!nome || !descricao) {
        return res.status(400).json({ error: 'Os campos nome e descrição são obrigatórios.' });
    }

    const updateProfissaoQuery = `
        UPDATE profissoes 
        SET nome = ?, descricao = ? 
        WHERE idProfissoes = ?
    `;

    pool.query(updateProfissaoQuery, [nome, descricao, profissaoId], (error, result) => {
        if (error) {
            console.error("Erro ao atualizar profissão:", error);
            return res.status(500).json({ error: 'Erro ao atualizar profissão' });
        }

        // Verifica se alguma linha foi afetada (se a profissão existia)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Profissão não encontrada' });
        }

        res.status(200).json({ message: 'Profissão atualizada com sucesso!' });
    });
});


module.exports = router;
