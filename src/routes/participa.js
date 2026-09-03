/*const express = require("express");
const router = express.Router();
const db = require("../db");

//Atores de todos os filmes:
router.get("/", async (req, res) => {
    try {
        //Fazer um retorno de dados parecido
        const r = await db.query("SELECT filmes.titulo, filmes.sinopse, atores.nome, atores.nacionalidade FROM filmes_atores JOIN atores ON atores.id = filmes_atores.idAtor JOIN filmes ON filmes.id = filmes_atores.idFilme")
        res.send(r.rows)
        if (r.rowCount == 0){
            return res.status(400).json({msg: "Não há relação de atores e filmes!"})
        }
        res.status(200).json(r.rows)
    } catch (error) {
        res.status(500).json({msg: error})
    }
});

//Mostra os atores de um determinado filme:
router.get("/:id", async (req, res) => {
    try {
        let id = req.params.id
        //Confere se existe algum filme com esse id
        const r = await db.query("SELECT filmes.titulo, filmes.sinopse, atores.nome ator, atores.nacionalidade FROM filmes_atores JOIN atores ON atores.id = filmes_atores.idAtor JOIN filmes ON filmes.id = filmes_atores.idFilme WHERE filmes.id = $1", [id])
        let r2 = {filme: r.rows[0].titulo, atores: []}
        for (let obj of r.rows){
            r2.atores.push(obj.ator)
        }
        res.send(r2)
        //res.send(r.rows)
        //if (r.rowCount == 0){
        //    return res.status(400).json({msg: "Não há relação de entre atores neste filme!"})
        //}
        //res.status(200).json(r.rows)
    } catch (error) {
        res.status(500).json({msg: error})
    }
});

//Adicionar um ator a um filme
router.post("/:id", async (req, res) => {
    try {
        let id = req.params.id
        const {idAtor, idUsuario} = req.body

        //Verificação
        const r1 = await db.query("SELECT * FROM usuario WHERE id = $1", [idUsuario])
        if (r1.rowCount == 0){
            return res.status(404).json({msg: "Usuário não existe!"})
        }
        if (r1.rows[0].administrador == false){
            return res.status(404).json({msg: "O usuário deve ser um administrador!"})
        }
        const r2 = await db.query("SELECT * FROM atores WHERE id = $1", [idAtor])
        if (r2.rowCount == 0){
            return res.status(404).json({msg: "Ator não existe!"})
        }
        const r3 = await db.query("SELECT * FROM filmes WHERE id = $1", [id])
        if (r3.rowCount == 0){
            return res.status(404).json({msg: "Filme não existe!"})
        }

        //Pensar na mensagem que será mostrada
        const r4 = await db.query("INSERT INTO filmes_atores(idFilme, idAtor) VALUES ($1, $2) RETURNING *", [id, idAtor])
        res.send(r4.rows)

    } catch (error) {
        res.status(500).json({msg: error})
    }    
});


//Retirar um ator de um filme
router.delete("/:id", async (req, res) => {
    try {
        let id = req.params.id
        const {idAtor, idUsuario} = req.body

        //Verificação
        const r1 = await db.query("SELECT * FROM usuario WHERE id = $1", [idUsuario])
        if (r1.rowCount == 0){
            return res.status(404).json({msg: "Usuário não existe!"})
        }
        if (r1.rows[0].administrador == false){
            return res.status(404).json({msg: "O usuário deve ser um administrador!"})
        }
        const r2 = await db.query("SELECT * FROM atores WHERE id = $1", [idAtor])
        if (r2.rowCount == 0){
            return res.status(404).json({msg: "Ator não existe!"})
        }
        const r3 = await db.query("SELECT * FROM filmes WHERE id = $1", [id])
        if (r3.rowCount == 0){
            return res.status(404).json({msg: "Filme não existe!"})
        }

        //Pensar na mensagem que será mostrada
        const r4 = await db.query("SELECT id FROM filmes_atores WHERE idAtor = $1 AND idFilme = $2", [idAtor, id])
        const r5 = await db.query("DELETE FROM filmes_atores WHERE id = $1", [r4.rows[0].id])
        res.status(200).json({msg: "Ator retirado de filme"})

    } catch (error) {
        res.status(500).json({msg: error})
    }
})

//Alterar o ator de filme, por exemplo: San Goodman do filme A vai para o filme B
router.put("/", async (req, res) => {
    try {
        res.status(200).json({msg: "Alterar o ator de algum filme"})
    } catch (error) {
        res.status(500).json({msg: error})
    }
})

module.exports = router;*/