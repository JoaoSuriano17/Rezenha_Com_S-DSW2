const express = require("express");
const router = express.Router();
const db = require("../db");

function verificarId(id) {
    if (isNaN(id)) {
        return false;
    }
    if (Number(id) <= 0) {
        return false;
    }
    return true;
}

// GET - geral
router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM atores")
        if (r.rowCount == 0){
            return res.status(400).json({msg: "Não há atores!"})
        }
        res.status(200).json({atores: r.rows})
    } catch (error) {
        res.status(500).json({msg: error})
    }
});


router.get("/participa", async (req, res)=>{
    try{
        //const r=await db.query("SELECT filmes.titulo, filmes.sinopse, atores.nome, atores.nacionalidade FROM filmes_atores JOIN atores ON atores.id = filmes_atores.idAtor JOIN filmes ON filmes.id = filmes_atores.idFilme")
        const r=await db.query("SELECT atores.id idator, atores.nome ator, atores.nacionalidade, filmes.id idfilme, filmes.titulo FROM filmes_atores JOIN atores ON atores.id=filmes_atores.idAtor JOIN filmes ON filmes.id=filmes_atores.idFilme");
        let lapf=[];
        /*
        lapf=[
            {
            idator:
            ator:
            nacionalidade:
            filmes:[
                {
                idfilme:
                titulo:
                }
            ]
            },
            {...}
        ]
        */
        for(let i=0; i<r.rows.length; i++){//f-a
            let atorConsta=false;
            for(let j=0; j<lapf.length; j++){//a
                if(r.rows[i].ator==lapf[j].ator){
                    atorConsta=true;
                    lapf[j].filmes.push({
                        idFilme:idFilme,
                        titulo:titulo
                    })
                    break;
                }
            }
            if(!atorConsta){
                lapf.push(
                {
                    idator:idator,
                    ator:ator,
                    filmes:[
                        {
                            idfilme:idfilme,
                            titulo:titulo
                        }
                    ]
                });
            }
        }
        res.status(200).json({c:lapf});
    }catch(erro){
        res.status(400).json({msg:"Bixou"+erro});
    }
});


// GET - específico
router.get("/:id", async (req, res) => {
    try {
        let id = req.params.id
        if (!verificarId(id)) {
            return res.status(400).json({
                erro: "O id deve ser um número válido"
            });
        }

        const r = await db.query("SELECT * FROM atores WHERE id=$1", [id])
        if (r.rowCount == 0){
            return res.status(400).json({msg: "Ator não existente!"})
        }
        res.status(200).json({ator: r.rows})
    } catch (error) {
        res.status(500).json({msg: error});
    }
});

//Criar um ator
router.post("/", async (req, res) => {
    try {
        const { idUsuario, nome, nascimento, nacionalidade, descricao, qtde_premios } = req.body || {}
        if(!nome){throw new Error("Nome não identificado!");}
		if(!nascimento){throw new Error("Nascimento não identificada!");}
		if(!nacionalidade){throw new Error("Nacionalidade não identificado!");}
        if(!descricao){throw new Error("Nacionalidade não identificado!");}
        if(!qtde_premios){throw new Error("Nacionalidade não identificado!");}
        if(!idUsuario){throw new Error("O id do usuário deve ser passado");}
        
        const r1 = await db.query("SELECT id FROM usuarios WHERE id = $1 AND administrador = TRUE", [idUsuario])
        if (r1.rows.length === 0){
            return res.status(400).json({msg: "Usuários não existente ou não é administrador!"})
        }
    
        //Podemos conferir se existe dois atores; para isso, o nome dele deve ser UNIQUE

        const r2 = await db.query("INSERT INTO atores(nome, nascimento, nacionalidade, descricao, qtde_premios) VALUES ($1, $2, $3, $4, $5) RETURNING *", [nome, nascimento, nacionalidade, descricao, qtde_premios])
        if (r2.rowCount === 0){
            return res.status(400).json({msg: "Ator não existente!"})
        }

        res.status(200).json({msg: "Ator adicionado com sucesso!", ator: r2.rows[0]})
    } catch (error) {
        res.status(500).json({msg: error});
    }
});

//DEletar um ator
router.delete("/:id", async (req, res) => {
    try {
        let id = req.params.id
        if (!verificarId(id)) {
            return res.status(400).json({
                erro: "O id deve ser um número válido"
            });
        }

        const { idUsuario } = req.body || {}
        if(!idUsuario){throw new Error("O id do usuário deve ser passado");}
        
        const r1 = await db.query("SELECT id FROM usuarios WHERE id = $1 AND administrador = TRUE", [idUsuario])
        if (r1.rows.length === 0){
            return res.status(400).json({msg: "Usuários não existente ou não é administrador!"})
        }
    

        const r2 = await db.query("DELETE FROM atores WHERE id=$1", [id])
        if (r2.rowCount === 0){
            return res.status(400).json({msg: "Ator não existente!"})
        }

        res.status(200).json({msg: "Ator deletado com sucesso!", ator: r1.rows[0]})
    } catch (error) {
        res.status(500).json({msg: error});
    }
});

//falta PUT
//falta GET /participa/:idator
module.exports = router;