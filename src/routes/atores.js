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
        const r=await db.query("SELECT atores.id idator, atores.nome ator, atores.nacionalidade, filmes.id idfilme, filmes.titulo FROM filmes_atores JOIN atores ON atores.id=filmes_atores.idAtor JOIN filmes ON filmes.id=filmes_atores.idFilme");
        let lapf=[];

        for(let i=0; i<r.rows.length; i++){//f-a
            let atorConsta=false;
            for(let j=0; j<lapf.length; j++){//a
                if(r.rows[i].ator==lapf[j].ator){
                    atorConsta=true;
                    lapf[j].filmes.push({
                        idFilme:r.rows[i].idfilme,
                        titulo:r.rows[i].titulo
                    })
                    break;
                }
            }
            if(!atorConsta){
                lapf.push(
                {
                    idAtor:r.rows[i].idator,
                    ator:r.rows[i].ator,
                    filmes:[
                        {
                            idFilme:r.rows[i].idfilme,
                            titulo:r.rows[i].titulo
                        }
                    ]
                });
            }
        }
        res.status(200).json({participacoes:lapf});
    }catch(erro){
        res.status(400).json({msg:erro.message});
    }
});

router.get("/premiacoes", async (req, res)=>{
    try{
        const r=await db.query("SELECT * FROM atores");
        let lapp=[];
        for(let i=0; i<r.rows.length; i++){//a/p
            lapp.push({
                id: r.rows[i].id,
                nome: r.rows[i].nome,
                nascimento: r.rows[i].nascimento,
                nacionalidade: r.rows[i].nacionalidade,
                descricao: r.rows[i].descricao,
                qtde_premios: r.rows[i].qtde_premios
            })
        }
        for(let i=0; i<lapp.length; i++){
            for(let j=i+1; j<lapp.length; j++){
                if(lapp[j].qtde_premios>lapp[i].qtde_premios){
                    let t=lapp[i];
                    lapp[i]=lapp[j];
                    lapp[j]=t;
                }
            }
        }
        res.status(200).json({premiacoes:lapp.slice(0, 3)});
    }catch(erro){
        res.status(400).json({msg:erro.message});
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
        if(!descricao){throw new Error("Descrição não identificada!");}
        if(!qtde_premios){throw new Error("Quantidade de prêmios não identificada!");}
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

router.put("/:id", async (req, res)=>{
    try{
        const id=req.params.id||{};
        if(!id){throw new Error("Id não informado!");}
        const rp=await db.query("SELECT * FROM atores WHERE id=$1", [id]);
        if(rp.rowCount==0){return res.status(400).json("Ator não identificado.");}
        const idUsuario=req.body.idUsuario||{};
        if(!idUsuario){throw new Error("Usuário não informado.");}
        const rc = await db.query("SELECT id FROM usuarios WHERE id = $1 AND administrador = TRUE", [idUsuario])
        if(rc.rows.length === 0){
            return res.status(400).json({msg:"Usuário inexistente ou não é administrador!"})
        }
        let nome;
        if(req.body.nome){
            nome=req.body.nome;
            let r=await db.query("UPDATE atores SET nome=$1 WHERE id=$2", [nome, id]);
            if(r.rowCount==0){
                return res.status(500).json({msg:"Não foi alterado o nome do ator."});
            }
        }
        let nascimento;
        if(req.body.nascimento){
            nascimento=req.body.nascimento;
            let r=await db.query("UPDATE atores SET nascimento=$1 WHERE id=$2", [nascimento, id]);
            if(r.rowCount==0){
                return res.status(500).json({msg:"Não foi alterada a data de nascimento do ator."});
            }
        }
        let descricao;
        if(req.body.descricao){
            descricao=req.body.descricao;
            let r=await db.query("UPDATE atores SET descricao=$1 WHERE id=$2", [descricao, id]);
            if(r.rowCount==0){
                return res.status(500).json({msg:"Não foi alterada a descrição do ator."});
            }
        }
        let nacionalidade;
        if(req.body.nacionalidade){
            nacionalidade=req.body.nacionalidade;
            let r=await db.query("UPDATE atores SET nacionalidade=$1 WHERE id=$2", [nacionalidade, id]);
            if(r.rowCount==0){
                return res.status(500).json({msg:"Não foi alterada a nacionalidade do ator."});
            }
        }
        let qtde_premios;
        if(req.body.qtde_premios){
            qtde_premios=req.body.qtde_premios;
            let r=await db.query("UPDATE atores SET qtde_premios=$1 WHERE id=$2", [qtde_premios, id]);
            if(r.rowCount==0){
                return res.status(500).json({msg:"Não foi alterada a quantidade de prêmios do ator."});
            }
        }
        return res.status(200).json({msg:"Atualização realizada com sucesso!"});
    }catch(erro){
        return res.status(400).json({msg:erro.message});
    }
});

module.exports = router;