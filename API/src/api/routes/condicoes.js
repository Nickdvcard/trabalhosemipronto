const express = require('express');
const router = express.Router();
const pool = require('../../../src/conexao');

// Rota para obter todas as condições
router.get('/', (req, res) => {
    const query = 'SELECT idCondicoes as id, nome, descricao FROM bancoapae6.condicoes;';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao obter condições:', err);
            res.status(500).json({ error: 'Erro ao obter condições' });
        } else {
            res.json(results);
        }
    });
});

// Rota para cadastrar uma nova condição
router.post('/', async (req, res) => {
    const { nome, descricao } = req.body;

    try {
        console.log('Dados recebidos:', req.body);

        // Query para inserir condição
        const condicaoQuery = `
            INSERT INTO condicoes (nome, descricao)
            VALUES (?, ?)
        `;

        const condicaoResult = await pool.promise().query(condicaoQuery, [
            nome,
            descricao
        ]);

        // Responde ao cliente
        res.status(200).json({ message: 'Condição cadastrada com sucesso.' });
    } catch (error) {
        console.error('Erro ao cadastrar condição:', error);
        res.status(500).json({ error: 'Erro ao cadastrar condição.' });
    }
});

// Rota para deletar uma condição por id
router.delete('/id/:id', (req, res) => {
    const condicaoId = req.params.id;

    // Deletar a condição da tabela
    const deleteCondicaoQuery = 'DELETE FROM condicoes WHERE idCondicoes = ?';

    pool.query(deleteCondicaoQuery, [condicaoId], (error, result) => {
        if (error) {
            console.error("Erro ao deletar condição:", error);
            return res.status(500).json({ error: 'Erro ao deletar condição' });
        }

        // Verifica se alguma linha foi afetada (se a condição existia)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Condição não encontrada' });
        }

        res.status(200).json({ message: 'Condição deletada com sucesso!' });
    });
});

// Rota para verificar se uma condição está associada
router.get('/check/:id', async (req, res) => {
    const condicaoId = req.params.id;

    const checkQuery = `
        SELECT COUNT(*) AS total
        FROM pacientes
        WHERE Condicoes_id_FK = ?
    `;

    try {
        const [result] = await pool.promise().query(checkQuery, [condicaoId]);

        const isLinked = result[0].total > 0;
        res.status(200).json({ isLinked });
    } catch (error) {
        console.error('Erro ao verificar associação:', error);
        res.status(500).json({ error: 'Erro ao verificar associação.' });
    }
});

// Rota para obter uma condição por id
router.get('/id/:id', (req, res) => {
    const condicaoId = req.params.id;

    const getCondicaoQuery = 'SELECT * FROM condicoes WHERE idCondicoes = ?';

    pool.query(getCondicaoQuery, [condicaoId], (error, result) => {
        if (error) {
            console.error("Erro ao buscar condição:", error);
            return res.status(500).json({ error: 'Erro ao buscar condição' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Condição não encontrada' });
        }

        res.status(200).json(result[0]); // Retorna apenas a condição encontrada
    });
});

// Rota para atualizar uma condição por id
router.put('/id/:id', (req, res) => {
    const condicaoId = req.params.id;
    const { nome, descricao } = req.body;

    // Verifica se os campos estão presentes
    if (!nome || !descricao) {
        return res.status(400).json({ error: 'Os campos nome e descrição são obrigatórios.' });
    }

    const updateCondicaoQuery = `
        UPDATE condicoes 
        SET nome = ?, descricao = ? 
        WHERE idCondicoes = ?
    `;

    pool.query(updateCondicaoQuery, [nome, descricao, condicaoId], (error, result) => {
        if (error) {
            console.error("Erro ao atualizar condição:", error);
            return res.status(500).json({ error: 'Erro ao atualizar condição' });
        }

        // Verifica se alguma linha foi afetada (se a condição existia)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Condição não encontrada' });
        }

        res.status(200).json({ message: 'Condição atualizada com sucesso!' });
    });
});

module.exports = router;
