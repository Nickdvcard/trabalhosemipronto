const express = require('express');
const router = express.Router();
const pool = require('../../../src/conexao');

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }

    console.log('Conexão bem-sucedida!');

    // Realize uma consulta simples, por exemplo, uma busca por dados.
    connection.query('SELECT 1 + 1 AS result', (err, results) => {
        if (err) {
            console.error('Erro ao executar a consulta:', err);
            return;
        }

        console.log('Resultado da consulta:', results[0].result);

        // Feche a conexão após o teste
        connection.release();
    });
});