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

//Get - todos os diretores
router.get("/", async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM diretores");
        if (resultado.rowCount == 0){
            return res.status(404).json({msg: "Não há nenhum diretor no sistema!"})
        }

        res.status(200).json({diretores: resultado.rows});
    } catch (erro) {
        res.status(500).json({msg: erro.message});
    }
});

//Get - todos os filmes que cada diretor dirigiu
router.get("/dirige", async (req, res)=>{
    try{
        const r = await db.query("SELECT * FROM diretores JOIN filmes ON diretores.id = filmes.diretor");
        if (r.rowCount==0){
            return res.status(404).json("Nenhuma relação de direção encontrada.");
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

        res.json(l2)
    }catch(erro){
        res.status(400).json({msg:erro.message})
    }
})

//Get - todos os filmes de um determinado diretor
router.get("/:id/dirige/", async (req, res) => {
    try {
        if (!verificarId(req.params.id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }

        const r = await db.query(`SELECT * FROM filmes JOIN diretores ON filmes.diretor = diretores.id WHERE diretores.id = $1`, [req.params.id]);
        if (r.rowCount === 0) {
            return res.status(404).json({msg:"Nenhum filme encontrado para esse diretor, ou o diretor não existe."});
        }

        let dic={[r.rows[0].nome]:[]}

        for (let c=0; c<r.rowCount; c++){
            dic[r.rows[0].nome].push(r.rows[c].titulo)
        }
        res.json(dic);
    } catch (erro) {
        res.status(400).json({msg:erro.message});
    }
});

//Get - os 3 diretores mais premiados
router.get("/premiacoes", async (req, res)=>{
    try{
        const r=await db.query("SELECT * FROM diretores");
        let ldmp=[];
        for(let i=0; i<r.rows.length; i++){
            ldmp.push({
                id: r.rows[i].id,
                nome: r.rows[i].nome,
                nascimento: r.rows[i].nascimento,
                descricao: r.rows[i].descricao,
                qtde_premios: r.rows[i].qtde_premios
            })
        }
        for(let i=0; i<ldmp.length; i++){
            for(let j=i+1; j<ldmp.length; j++){
                if(ldmp[j].qtde_premios>ldmp[i].qtde_premios){
                    let t=ldmp[i];
                    ldmp[i]=ldmp[j];
                    ldmp[j]=t;
                }
            }
        }
        res.status(200).json({premiacoes:ldmp.slice(0, 3)});
    }catch(erro){
        res.status(400).json({msg:erro.message});
    }
});

//Get - diretor específico
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!verificarId(id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }

        const resultado = await db.query("SELECT * FROM diretores WHERE id = $1", [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({msg: "Diretor não encontrado"});
        }

        res.status(200).json({diretor: resultado.rows[0]});
    } catch (erro) {
        res.status(500).json({msg:erro.message});
    }
});

//Post - criar um novo diretor
router.post("/", async (req, res) => {
    try {
        const { nome, nascimento, descricao, qtde_premios } = req.body;

        const resultado = await db.query("INSERT INTO diretores (nome, nascimento, descricao, qtde_premios) VALUES ($1, $2, $3, $4) RETURNING *", [nome, nascimento, descricao, qtde_premios]);
        res.status(200).json({msg: "Diretor adicionado com sucesso!", diretor: resultado.rows[0]});

    } catch (erro) {
        res.status(500).json({msg: erro});
    }
});

//Delete - deletar um diretor se ele não tiver nenhum filme associado
router.delete("/:id", async (req, res) => {
    try {
        if (!verificarId(req.params.id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }

        const { idUsuario } = req.body || {}
        const r1 = await db.query("SELECT id FROM usuarios WHERE id = $1 AND administrador = TRUE", [idUsuario])
        if (r1.rows.length === 0){
            return res.status(400).json({msg: "Usuários não existente ou não é administrador!"})
        }

        const r2 = await db.query("SELECT diretores.id diretor, filmes.id filme FROM diretores JOIN filmes ON diretores.id = filmes.diretor WHERE diretores.id = $1", [req.params.id])
        if (r2.rowCount == 0){
            const resultado = await db.query("DELETE FROM diretores WHERE id = $1 RETURNING *", [req.params.id]);
        }else{
            return res.status(400).json({msg: "Este diretor tem filme(s) associados, não é possível deletá-lo!"})
        }
        res.json({msg: "Diretor deletado com sucesso!"})

    } catch (erro) {
        res.status(500).json({msg: erro.message});
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { idUsuario, nome, nascimento, descricao, qtde_premios } = req.body;
            if(nome.length > 85){
                return res.status(400).json({msg: "Nome ultrapassou os limites de caracteres!"})
            }
            if(!verificarId(qtde_premios)) {
                return res.status(400).json({msg: "A quantidade de prêmios deve ser um número válido"});
            }

        if (!verificarId(id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }
        const r1 = await db.query("SELECT id FROM usuarios WHERE id = $1 AND administrador = TRUE", [idUsuario])
        if (r1.rows.length === 0){
            return res.status(400).json({msg: "Usuário não existente ou não é administrador!"})
        }

        const anterior = await db.query("SELECT * FROM diretores WHERE id=$1", [id])
        if (anterior.rowCount == 0){
            return res.status(400).json({msg: "Não existe diretor com esse id!"})
        }
        const novoNome = nome ?? diretorAtual.nome;
        const novoNascimento = nascimento ?? diretorAtual.nascimento;
        const novaDescricao = descricao ?? diretorAtual.descricao;
        const novaQtdePremios = qtde_premios ?? diretorAtual.qtde_premios;

        const resultado = await db.query("UPDATE diretores SET nome = $1, nascimento = $2, descricao = $3, qtde_premios = $4 WHERE id = $5 RETURNING *", [novoNome, novoNascimento, novaDescricao, novaQtdePremios, id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({msg: "Erro ao atualizar os dados!"});
        }

        res.status(200).json({msg: "Diretor atualizado com sucesso", diretor: resultado.rows[0] });
    } catch (erro) {
        res.status(500).json({msg: erro});
    }
});

module.exports = router;