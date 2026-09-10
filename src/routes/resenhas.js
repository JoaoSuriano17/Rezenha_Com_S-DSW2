const express = require("express");
const router = express.Router();
const db = require("../db");

async function verificarAdmin(id) {
    if (isNaN(id)) {
        return "O id deve ser um número!";
    }
    if (Number(id) <= 0) {
        return "O id deve ser um número válido!";
    }
    const r = await db.query("SELECT id, administrador FROM usuarios WHERE id=$1", [id])
    if (r.rowCount == 0){
        return "Não há usuário com esse id!"
    }else if (!r.rows[0].administrador){
        return "Usuário não é administrador!"
    }
}

//Get - todas as resenhas
router.get("/", async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM resenhas");
        if (resultado.rowCount == 0){
            return res.status(404).json({msg: "Não existe nenhuma resenha no sistema!"})
        }
        res.status(200).json({resenhas: resultado.rows});
    } catch (erro) {
        res.status(500).json({msg: "Erro ao buscar as resenhas públicas"});
    }
});

//Get - todas as resenhas de usuário não-críticos
router.get("/publicos", async (req, res) => {
    try {
        const resultado = await db.query("SELECT resenhas.* FROM resenhas INNER JOIN usuarios ON usuarios.id = resenhas.idUsuario WHERE usuarios.critico = false");
        if (resultado.rowCount == 0){
            return res.status(404).json({msg: "Não existe nenhuma resenha no sistema!"})
        }
        res.status(200).json({resenhas: resultado.rows});
    } catch (erro) {
        res.status(500).json({msg: "Erro ao buscar as resenhas públicas"});
    }
});

//Get - todas as resenhas de usuário não-críticos específico
router.get("/publicos/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (isNaN(id)){
            res.status(400).json({msg: "O id deve ser um número"})
        }

        const resultado = await db.query(`SELECT resenhas.* FROM resenhas INNER JOIN usuarios ON usuarios.id = resenhas.idUsuario WHERE resenhas.id = $1 AND usuarios.critico = false`, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({msg: "Não existe nenhuma resenha público com esse id!"});
        }

        res.status(200).json({resenha: resultado.rows[0]});
    } catch (erro) {
        res.status(500).json({msg: erro});
    }
});

//Post - Criar uma resenha
router.post("/", async (req, res) => {
    try {
        const { idUsuario, idFilme, resenha, avaliacao} = req.body || {};

        if(!idUsuario){throw new Error("Id do usuário não identificado!");}
		if(!idFilme){throw new Error("Id do filme não identificado!");}
		if(!resenha){throw new Error("Resenha não identificada!");}
		if(!avaliacao){throw new Error("Avaliação não identificada!");}

        if(isNaN(idUsuario)){
            res.status(400).json({msg: "O idUsuario deve ser um número válido!"})
        }else if(isNaN(idFilme)){
            res.status(400).json({msg: "O idFilme deve ser um número válido!"})
        }
        //Sequência de verificações: 

        const resultado = await db.query("INSERT INTO resenhas (idUsuario, idFilme, resenha, avaliacao) VALUES ($1, $2, $3, $4) RETURNING *", [ idUsuario, idFilme, resenha, avaliacao ]);
        res.status(201).json({msg: "Resenha adicionada com sucesso!", resenha: resultado.rows[0]});

    } catch (erro) {
        res.status(500).json({msg: erro.message});
    }
});

//Delete - deletar uma resenha em específico
/*
router.delete("/:id", async (req, res) => {
    try {
        const {idUsuario} = req.body;


        // Verifica se o usuário existe
        const usuario = await db.query(
            `SELECT critico
             FROM usuarios
             WHERE id = $1`,
            [idUsuario]
        );

        if (usuario.rows.length === 0) {
            return res.status(400).json({
                msg: "Usuário não encontrado"
            });
        }



        // Exclui somente se a resenha pertencer ao usuário
        const resultado = await db.query(
            `DELETE FROM resenhas
             WHERE id = $1
             AND idUsuario = $2
             RETURNING *`,
            [id, idUsuario]
        );


        if (resultado.rows.length === 0) {
            return res.status(400).json({
                msg: "Resenha não encontrada ou não pertence ao usuário"
            });
        }


        res.status(200).json({
            mensagem: "Resenha excluída com sucesso",
            resenha: resultado.rows[0]
        });

    } catch (erro) {

        res.status(500).json({
            msg: "Erro ao excluir a resenha pública"
        });
    }
});*/

//Put - altera os atributos de alguma resenha
router.put("/:id", async (req, res) => {
    try{
        const id = req.params.id;
        if (isNaN(id) || id <= 0){
            res.status(400).json({msg: "O id deve ser um número válido!"})
        }
        
        let { idUsuario, resenha, avaliacao } = req.body;

        if (!idUsuario){throw new Error ("Id do usuário não identificado");}
        if (!resenha && !avaliacao){throw new Error ("Informe resenha e/ou avaliação para atualizar");}

        const usuario = await db.query(`SELECT nome FROM usuarios WHERE id = $1`, [idUsuario]);
        if (usuario.rows.length === 0) {
            return res.status(404).json({msg: "Usuário não encontrado"});
        }

        const consulta = await db.query(`SELECT * FROM resenhas WHERE id = $1 AND idUsuario = $2`, [id, idUsuario]);
        if (consulta.rows.length === 0) {
            return res.status(404).json({msg: "Resenha não encontrada ou não pertence a este usuário"});
        }

        const resenhaAtual = consulta.rows[0];

        if (!resenha){
            resenha = resenhaAtual.resenha
        }
        if (!avaliacao){
            avaliacao = resenhaAtual.avaliacao
        }
        const resultado = await db.query("UPDATE resenhas SET resenha = $1, avaliacao = $2 WHERE id = $3 AND idUsuario = $4 RETURNING *", [ resenha, avaliacao, id, idUsuario ] );
        res.status(200).json({msg: "Resenha atualizada com sucesso!", resenha: resultado.rows[0]});
    } catch (erro){
        res.status(500).json({msg: erro.message});
    }
});

//Get - mostra todas as resenhas de usuários críticos
router.get("/criticos", async (req, res) => {
    try {
        const resultado = await db.query(`SELECT resenhas.* FROM resenhas INNER JOIN usuarios ON usuarios.id = resenhas.idUsuario WHERE usuarios.critico = true ORDER BY id ASC`);

        res.status(200).json({resenhas: resultado.rows});
    } catch (erro) {
        res.status(500).json({msg: "Erro ao buscar as resenhas dos críticos"});
    }
});

//Get - mostra a resenha de um usuário crítico
router.get("/criticos/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (isNaN(id) || id <=0){
            res.status(400).json({msg: "O id deve ser um número válido"})
        }

        const resultado = await db.query(`SELECT resenhas.* FROM resenhas INNER JOIN usuarios ON usuarios.id = resenhas.idUsuario WHERE resenhas.id = $1 AND usuarios.critico = true`, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({msg: "Resenha de crítico não encontrada"});
        }

        res.status(200).json({resenha: resultado.rows[0]});
    } catch (erro) {
        res.status(500).json({msg: "Erro ao buscar a resenha do crítico"});
    }
});

router.delete("/:id", async (req, res)=>{
    try{
        let id = req.params.id

        const usuario=await db.query("SELECT id FROM usuarios WHERE id=$1", [req.body.idUsuario])
        const resenha=await db.query("SELECT idUsuario FROM resenhas WHERE id=$1", [id])

        const r=await db.query("DELETE FROM resenhas WHERE id=$1 AND idUsuario=$2", [id, req.body.idUsuario ])
        res.json({msg:"Resenha deletada com sucesso!"})
    }catch(erro){
        res.status(500).json({msg: erro})
    }
})

module.exports = router;