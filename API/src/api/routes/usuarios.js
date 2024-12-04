const express = require('express');
const router = express.Router();
const pool = require('../../../src/conexao');

// Rota para login e autenticação
router.post('/login', (req, res) => {
    const { username, senha } = req.body; // Extrai username e senha do corpo da requisição

    console.log("aaaaaaaaaaaaaa")

    if (!username || !senha) {
        return res.status(400).json({ error: 'Username e senha são obrigatórios.' });
    }

    // Consulta para verificar o usuário e a senha com SHA2
    const query = `
        SELECT idusuario, login 
        FROM usuarios 
        WHERE login = ? AND senhaHash = SHA2(?, 256)
    `;

    pool.query(query, [username, senha], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' }); // Login ou senha incorretos
        }

        const usuario = results[0];

        // Retornando a resposta com o token
        res.json({
            message: 'Login bem-sucedido!',
            usuario: {
                id: usuario.idusuario,
                login: usuario.login,
            },
        });
    });
});

module.exports = router;
