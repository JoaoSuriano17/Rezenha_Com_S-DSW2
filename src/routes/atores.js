const express = require("express");
const router = express.Router();
const db = require("../db");


// GET - geral
router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM atores")
        if (r.rowCount == 0){
            return res.status(400).json({msg: "Não há atores!"})
        }
        res.status(200).json(r.rows)
    } catch (error) {
        res.status(500).json({msg: error})
    }
});


// GET - específico
router.get("/:id", async (req, res) => {
    try {
        let id = req.params.id
        const r = await db.query("SELECT * FROM atores WHERE id=$1", [id])
        if (r.rowCount == 0){
            return res.status(400).json({msg: "Ator não existente!"})
        }
        res.status(200).json(r.rows)
    } catch (error) {
        res.status(500).json({msg: error});
    }
});

router.post("/", async (req, res) => {
    try {
        const { idAdmin } = req.body || {}

        //Conferir se existe um usuário com esse idAdmin!

        const r = await db.query("INSERT INTO autores FROM atores WHERE id=$1", [id])
        if (r.rowCount == 0){
            return res.status(400).json({msg: "Ator não existente!"})
        }
        res.status(200).json(r.rows)
    } catch (error) {
        res.status(500).json({msg: error});
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
//falta GET /participa/:idator
module.exports = router;