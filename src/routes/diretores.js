const express = require("express");

const router = express.Router();

const db = require("../db");


// GET - todos os diretores
router.get("/diretores", async (req, res) => {
    try {
        const resultado = await db.query(
            "SELECT * FROM diretor"
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});


// GET - diretor por ID
router.get("/diretores/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            "SELECT * FROM diretor WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                msg: "Diretor não encontrado"
            });
        }

        res.status(200).json(resultado.rows[0]);

    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

router.post("/diretores", async (req, res) => {
    try {
        const { nome, nascimento, descricao, qtde_premios } = req.body;

        const resultado = await db.query(
            `INSERT INTO diretor 
            (nome, nascimento, descricao, qtde_premios)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [nome, nascimento, descricao, qtde_premios]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

router.delete("/diretores/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            "DELETE FROM diretor WHERE id = $1 RETURNING *",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                msg: "Diretor não encontrado"
            });
        }

        res.status(200).json({
            msg: "Diretor deletado com sucesso",
            diretor: resultado.rows[0]
        });

    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

router.put("/diretores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, nascimento, descricao, qtde_premios } = req.body;

        const resultado = await db.query(
            `UPDATE diretor
             SET nome = $1,
                 nascimento = $2,
                 descricao = $3,
                 qtde_premios = $4
             WHERE id = $5
             RETURNING *`,
            [nome, nascimento, descricao, qtde_premios, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                msg: "Diretor não encontrado"
            });
        }

        res.status(200).json({
            msg: "Diretor atualizado com sucesso",
            diretor: resultado.rows[0]
        });

    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

module.exports = router;