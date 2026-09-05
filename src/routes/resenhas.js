const express = require("express");

const router = express.Router();

const db = require("../db");

// ========================================
// GET /resenhas/publico
// Lista somente resenhas de usuários
// que NÃO são críticos
// ========================================
router.get("/publico", async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT resenhas.*
             FROM resenhas
             INNER JOIN usuarios
             ON usuarios.id = resenhas.idUsuario
             WHERE usuarios.critico = false`
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar as resenhas públicas"
        });
    }
});


// ========================================
// GET /resenhas/publico/:id
// Busca uma resenha pública específica
// ========================================
router.get("/publico/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const resultado = await db.query(
            `SELECT resenhas.*
             FROM resenhas
             INNER JOIN usuarios
             ON usuarios.id = resenhas.idUsuario
             WHERE resenhas.id = $1
             AND usuarios.critico = false`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Resenha pública não encontrada"
            });
        }

        res.status(200).json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar a resenha pública"
        });
    }
});


// ========================================
// POST /resenhas/publico
// Cria uma resenha pública
// ========================================
router.post("/publico", async (req, res) => {
    try {
        const {
            idUsuario,
            idFilme,
            resenha,
            avaliacao
        } = req.body;


        // ========================================
        // Verifica se o usuário existe
        // ========================================
        const usuario = await db.query(
            `SELECT critico
             FROM usuarios
             WHERE id = $1`,
            [idUsuario]
        );

        if (usuario.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado"
            });
        }


        // ========================================
        // Verifica se o usuário é crítico
        // ========================================
        if (usuario.rows[0].critico === true) {
            return res.status(403).json({
                erro: "Usuários críticos não podem publicar resenhas públicas"
            });
        }


        // ========================================
        // Cria a resenha
        // ========================================
        const resultado = await db.query(
            `INSERT INTO resenhas
             (idUsuario, idFilme, resenha, avaliacao)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                idUsuario,
                idFilme,
                resenha,
                avaliacao
            ]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao criar a resenha pública"
        });
    }
});


// ========================================
// PUT /resenhas/publico
// Atualiza somente:
// - resenha
// - avaliacao
//
// NÃO altera:
// - idUsuario
// - idFilme
// ========================================
router.put("/publico", async (req, res) => {
    try {
        const {
            id,
            idUsuario,
            resenha,
            avaliacao
        } = req.body;


        // ========================================
        // Verifica o ID da resenha
        // ========================================
        if (!id) {
            return res.status(400).json({
                erro: "O id da resenha é obrigatório"
            });
        }


        // ========================================
        // Verifica o ID do usuário
        // ========================================
        if (!idUsuario) {
            return res.status(400).json({
                erro: "O idUsuario é obrigatório"
            });
        }


        // ========================================
        // Verifica se informou algo para atualizar
        // ========================================
        if (
            resenha === undefined &&
            avaliacao === undefined
        ) {
            return res.status(400).json({
                erro: "Informe resenha e/ou avaliacao para atualizar"
            });
        }


        // ========================================
        // Verifica se o usuário existe
        // e se ele é crítico
        // ========================================
        const usuario = await db.query(
            `SELECT critico
             FROM usuarios
             WHERE id = $1`,
            [idUsuario]
        );

        if (usuario.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado"
            });
        }


        // ========================================
        // Usuário crítico não pode alterar
        // resenha pública
        // ========================================
        if (usuario.rows[0].critico === true) {
            return res.status(403).json({
                erro: "Usuários críticos não podem alterar resenhas públicas"
            });
        }


        // ========================================
        // Busca a resenha do usuário
        // ========================================
        const consulta = await db.query(
            `SELECT *
             FROM resenhas
             WHERE id = $1
             AND idUsuario = $2`,
            [id, idUsuario]
        );

        if (consulta.rows.length === 0) {
            return res.status(404).json({
                erro: "Resenha não encontrada ou não pertence a este usuário"
            });
        }


        const resenhaAtual = consulta.rows[0];


        // ========================================
        // Mantém o valor antigo caso não tenha
        // sido enviado no Body
        // ========================================
        const novaResenha =
            resenha !== undefined
                ? resenha
                : resenhaAtual.resenha;


        const novaAvaliacao =
            avaliacao !== undefined
                ? avaliacao
                : resenhaAtual.avaliacao;


        // ========================================
        // Atualiza somente resenha e avaliacao
        // ========================================
        const resultado = await db.query(
            `UPDATE resenhas
             SET resenha = $1,
                 avaliacao = $2
             WHERE id = $3
             AND idUsuario = $4
             RETURNING *`,
            [
                novaResenha,
                novaAvaliacao,
                id,
                idUsuario
            ]
        );


        res.status(200).json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao atualizar a resenha pública"
        });
    }
});


// ========================================
// DELETE /resenhas/publico
// Exclui somente a própria resenha
// ========================================
router.delete("/publico", async (req, res) => {
    try {
        const {
            id,
            idUsuario
        } = req.body;


        // ========================================
        // Verifica se o usuário existe
        // ========================================
        const usuario = await db.query(
            `SELECT critico
             FROM usuarios
             WHERE id = $1`,
            [idUsuario]
        );

        if (usuario.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado"
            });
        }


        // ========================================
        // Usuário crítico não trabalha com
        // resenhas públicas
        // ========================================
        if (usuario.rows[0].critico === true) {
            return res.status(403).json({
                erro: "Usuários críticos não podem excluir resenhas públicas"
            });
        }


        // ========================================
        // Exclui somente se a resenha pertencer
        // ao usuário
        // ========================================
        const resultado = await db.query(
            `DELETE FROM resenhas
             WHERE id = $1
             AND idUsuario = $2
             RETURNING *`,
            [id, idUsuario]
        );


        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Resenha não encontrada ou não pertence ao usuário"
            });
        }


        res.status(200).json({
            mensagem: "Resenha excluída com sucesso",
            resenha: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao excluir a resenha pública"
        });
    }
});

// ========================================
// GET /resenhas/criticos
// Lista somente resenhas feitas por críticos
// ========================================
router.get("/criticos", async (req, res) => {
    try {
        const resultado = await db.query(`SELECT resenhas.* FROM resenhas INNER JOIN usuarios ON usuarios.id = resenhas.idUsuario WHERE usuarios.critico = true ORDER BY id ASC`);

        res.status(200).json(resultado.rows);
    } catch (erro) {
        res.status(500).json({msg: "Erro ao buscar as resenhas dos críticos"});
    }
});

// ========================================
// GET /resenhas/criticos/:id
// Busca uma resenha específica de um crítico
// ========================================
router.get("/criticos/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const resultado = await db.query(`SELECT resenhas.* FROM resenhas INNER JOIN usuarios ON usuarios.id = resenhas.idUsuario WHERE resenhas.id = $1 AND usuarios.critico = true`, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({msg: "Resenha de crítico não encontrada"});
        }

        res.status(200).json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({msg: "Erro ao buscar a resenha do crítico"});
    }
});

router.post("/criticos", async (req, res)=>{
    try{
        const usuario=await db.query("SELECT critico FROM usuarios WHERE id=$1", [req.body.idUsuario])
        const filme=await db.query("SELECT id FROM filmes WHERE id=$1", [req.body.idFilme])
        const resenha=await db.query("SELECT idUsuario, idFilme FROM resenhas")
  
        if (usuario.rowCount==0){
            return res.status(404).json({msg:"Bixou, não existe usuário com esse id"})
        }else if (filme.rowCount==0){
            return res.status(404).json({msg:"Bixou, não existe filme com esse id"})
        }else if (usuario.rows[0].critico==false){
            return res.json({msg:"Bixou, o usuário não é um crítico"})
        }

        for (let c of resenha.rows){
            if (c.idfilme==req.body.idFilme && c.idusuario==req.body.idUsuario){
                return res.status(500).json({msg:"Bixou, o crítico já fez a avaliação para esse filme"})
            }
        }

        const r=await db.query("INSERT INTO resenhas(idUsuario, idFilme, resenha, avaliacao) VALUES ($1, $2, $3, $4)", [req.body.idUsuario, req.body.idFilme, req.body.resenha, req.body.avaliacao])
        return res.json({msg:"Resenha adicionada"})
    }catch(erro){
        res.status(500).json({msg:"Bixou, "+erro})
    }
})


router.put("/criticos", async(req,res)=>{
    try{
        const usuario=await db.query("SELECT critico FROM usuarios WHERE id=$1", [req.body.idUsuario])
        const filme=await db.query("SELECT id FROM filmes WHERE id=$1", [req.body.idFilme])
        const resenha=await db.query("SELECT idUsuario FROM resenhas WHERE id=$1", [req.body.id])
  
        if (usuario.rowCount==0){
            return res.status(404).json({msg:"Bixou, não existe usuário com esse id"})

        }else if (filme.rowCount==0){
            return res.status(404).json({msg:"Bixou, não existe filme com esse id"})
            
        }else if (resenha.rowCount==0){
            return res.json({msg:"Resenha não existe"})

        }else if(resenha.rows[0].idusuario!=req.body.idUsuario){
            return res.json({msg:"Esse usuário não pode alterar essa resenha"})
    
        }else if (usuario.rows[0].critico==false){
            return res.json({msg:"Bixou, o usuário não é um crítico"})
        }

        const r=await db.query("UPDATE resenhas SET resenha=$1, avaliacao=$2 WHERE id=$3 AND idUsuario=$4", [req.body.resenha, req.body.avaliacao, req.body.id, req.body.idUsuario])
        return res.json({msg:"Resenha alterada"})
    }catch(erro){
        res.status(500).json({msg:"Bixou, "+erro})
    }
})


router.delete("/criticos", async (req, res)=>{
    try{
        const usuario=await db.query("SELECT id FROM usuarios WHERE id=$1", [req.body.idUsuario])
        const resenha=await db.query("SELECT idUsuario FROM resenhas WHERE id=$1", [req.body.id])

        if (usuario.rowCount==0){
            return res.status(404).json({msg:"Bixou, usuário não existe"})
        }else if (resenha.rowCount==0){
            return res.status(404).json({msg:"Bixou, resenha não existe"})
        }else if (resenha.rows[0].idusuario!=req.body.idUsuario){
            return res.status(404).json({msg:"Bixou, esse usuário não pode deletar essa resenha"})
        }

        const r=await db.query("DELETE FROM resenhas WHERE id=$1 AND idUsuario=$2", [req.body.id, req.body.idUsuario])
        res.json({msg:"Resenha deletada"})
    }catch(erro){
        res.status(500).json({msg:"Bixou, "+erro})
    }
})


module.exports = router;