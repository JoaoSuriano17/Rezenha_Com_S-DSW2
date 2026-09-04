const express = require("express");

const router = express.Router();

const db = require("../db");


// GET - todos os diretores
router.get("/", async (req, res) => {
    try {
        const resultado = await db.query(
            "SELECT * FROM diretores"
        );

        res.status(200).json(resultado.rows);

    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});



//-----------------------
//Diretores/dirige
//-------------------------



router.get("/dirige", async (req, res)=>{
    try{
        const r = await db.query(`SELECT * FROM diretores JOIN filmes ON diretores.id = filmes.diretor`);
        if (r.rowCount==0){
            return res.status(404).json("Bixou, nada encontrado")
        }

        let l=[]
        for (c of r.rows){
            if (!l.includes(c.nome)){
                l.push(c.nome)
            }
        }

        let l2=[]
        for (c=0; c<l.length; c++){
            l2.push({
                "nome":l[c],
                "filmes":[]
            })
        }

        for (c of r.rows){
            for (d=0; d<l2.length; d++){
                if (l2[d].nome==c.nome){
                    l2[d].filmes.push(c.titulo)
                }
            }
        }

        return res.json(l2)
    }catch(erro){
        res.status(400).json("Bixou, "+erro)
    }
})

router.get("/dirige/:id", async (req, res) => {
    try {
        const r = await db.query(`SELECT * FROM filmes JOIN diretores ON filmes.diretor = diretores.id WHERE diretores.id = $1`, [req.params.id]);

        if (r.rowCount === 0) {
            return res.status(404).json("Bixou, nenhum filme encontrado para esse diretor ou o diretor não existe");
        }

        let dic={[r.rows[0].nome]:[]}

        for (let c=0; c<r.rowCount; c++){
            dic[r.rows[0].nome].push(r.rows[c].titulo)
        }
        res.json(dic);
    } catch (erro) {
        res.status(400).json("Bixou, " + erro);
    }
});


//-------------------
//Fim
//------------------



// GET - diretor por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            "SELECT * FROM diretores WHERE id = $1",
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

router.post("/", async (req, res) => {
    try {
        const { nome, nascimento, descricao, qtde_premios } = req.body;

        const resultado = await db.query(
            `INSERT INTO diretores 
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

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            "DELETE FROM diretores WHERE id = $1 RETURNING *",
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

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, nascimento, descricao, qtde_premios } = req.body;

        const resultado = await db.query(
            `UPDATE diretores
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