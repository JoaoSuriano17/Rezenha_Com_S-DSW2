const express=require("express")
const db=require("../db")
const router=express()

function verificarId(id) {
    if (isNaN(id)) {
        return false;
    }
    if (Number(id) <= 0) {
        return false;
    }
    return true;
}

//Get - geral para filmes
router.get("/", async (req, res)=>{
    try{
        const r=await db.query("SELECT * FROM filmes")
        if (r.rowCount==0){
            return res.json({msg: "Bixou, nenhum filme cadastrado"})
        }
        res.json({filmes: r.rows})
    }catch(erro){
        res.status(500).json(erro)
    }
})

//GET que mostra todos os filmes e seus atores
router.get("/participa", async (req, res)=>{
    try{
        const r=await db.query("SELECT f.id idFilme, f.titulo, a.id idAtor, a.nome ator, a.nacionalidade FROM filmes_atores fa JOIN atores a ON a.id = fa.idAtor JOIN filmes f ON f.id = fa.idFilme")
        //res.send(r.rows)
        let filmes = []
        /*let filmes = []
        let qia=0;
        for (let contFilme = 0; contFilme<r.rows.length; contFilme++){
            if (contFilme > 0){
                if (filmes[qia-1].id == r.rows[contFilme].id){
                    filmes[qia-1].atores.push({id: r.rows[contFilme].idator, ator: r.rows[contFilme].ator, nacionalidade: r.rows[contFilme].nacionalidade})
                }else{
                    let filme = {id: r.rows[contFilme].idFilme, titulo: r.rows[contFilme].titulo, atores: []}
                    filmes.push(filme)
                    qia++
                }
            }else{
                let filme = {id: r.rows[contFilme].idfilme, titulo: r.rows[contFilme].titulo, atores: []}
                filmes.push(filme)
                qia++
            }
        }*/
       for (const linha of r.rows) {
            if (!filmes[linha.idfilme]) {
                filmes[linha.idfilme] = {
                    id: linha.idfilme,
                    titulo: linha.titulo,
                    atores: []
                };
            }

            filmes[linha.idfilme].atores.push({
                id: linha.idator,
                ator: linha.ator,
                nacionalidade: linha.nacionalidade
            });
        }



        //Adicionar o primeira autor -> 

        
            
        res.json({filmes: filmes})

        if (r.rowCount==0){
            return res.json("Bixou, nenhum filme cadastrado")
        }
        res.json(r.rows)
    }catch(erro){
        res.status(500).json(erro)
    }
})







//Mostrar todas as avaliações de todos os filme
router.get("/avaliacoes", async (req,res)=>{
    try{
        const r=await db.query("SELECT titulo, avaliacao FROM resenhas INNER JOIN filmes ON filmes.id=resenhas.idFilme")

        return res.json({"avaliacoes":r.rows})
    }catch(erro){
        res.status(500).json({msg:"Bixou, "+erro})
    }
})

//Mostrar todas as avaliações de um filme específico
router.get("/:id/avaliacao", async (req, res)=>{
    try{
        const r=await db.query("SELECT id, titulo FROM filmes WHERE id=$1", [req.params.id])
        const r2=await db.query("SELECT idUsuario, avaliacao FROM resenhas WHERE idFilme=$1", [req.params.id])

        if(r.rowCount==0){
            return res.json({msg:"Bixou, não existe filme com esse id"})
        }else if (r2.rowCount==0){
            return res.json({msg:"Bixou, esse filme não tem nenhuma avaliacao cadastrada"})
        }

        return res.json({id: r.rows[0].id, titulo: r.rows[0].titulo, avaliacoes: r2.rows})
    }catch(erro){
        res.status(500).json("Bixou, "+erro)
    }
})





//Mostrar todas as resenhas de todos os filmes
router.get("/resenhas", async(req,res)=>{
    try{
        const r=await db.query("SELECT idUsuario, titulo, resenha FROM resenhas INNER JOIN filmes ON filmes.id=resenhas.idFilme")

        return res.json({"resenhas":r.rows})
    }catch(erro){
        res.status(500).json({msg:"Bixou, "+erro})
    }
})

//Mostrar todas as resenhas de um filme específico
router.get("/:id/resenha", async (req, res)=>{
    try{
        const r=await db.query("SELECT id, titulo FROM filmes WHERE id=$1", [req.params.id])
        const r2=await db.query("SELECT idUsuario, resenha FROM resenhas WHERE idFilme=$1", [req.params.id])

        if(r.rowCount==0){
            return res.json({msg:"Bixou, não existe filme com esse id"})
        }else if (r2.rowCount==0){
            return res.json({msg:"Bixou, esse filme não tem nenhuma resenha cadastrada"})
        }

        return res.json({titulo: r.rows[0].titulo, idUsuario: r2.rows[0].idusuario, resenha: r2.rows[0].resenha})
    }catch(erro){
        res.status(500).json("Bixou, "+erro)
    }
})








router.get("/:id", async (req, res)=>{
    try{
        if (!verificarId(req.params.id)) {
            return res.status(400).json({
                erro: "O id deve ser um número válido"
            });
        }

        const r=await db.query('SELECT * FROM filmes WHERE id=$1',[req.params.id])
        if (r.rowCount==0){
            return res.json({msg: "Bixou, nenhum filme cadastrado"})
        }
        res.json({filme: r.rows[0]})
    }catch(erro){
        res.status(500).json(erro)
    }
})

router.post("/", async (req, res)=>{
    //Conferir se o usuário é administrador!
    try{
        const r=await db.query("SELECT id FROM diretores WHERE id=$1", [req.body.diretor])
        
        if (r.rowCount==0){
            return res.json({msg:"Bixou, não existe diretor com esse id"})
        }

        const final=await db.query("INSERT INTO filmes(titulo, diretor, sinopse, faixa_etaria, orcamento, duracao) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [req.body.titulo, req.body.diretor, req.body.sinopse, req.body.faixa_etaria, req.body.orcamento, req.body.duracao])
        res.json({msg: "Filme adicionado com sucesso", filme: final.rows[0]})
    }catch(erro){
        res.status(500).json(erro)
    }
})


router.get("/:id/ator/:idAtor", async (req, res)=>{
    try{
        if (!verificarId(req.params.id)) {
            return res.status(400).json({
                erro: "O id deve ser um número válido"
            });
        }

        if (!verificarId(req.params.idAtor)) {
            return res.status(400).json({
                erro: "O id do ator deve ser um número deve ser um número válido"
            });
        }

        const r=await db.query('SELECT * FROM filmes WHERE id=$1',[req.params.id])
        if (r.rowCount==0){
            return res.json({msg: "Bixou, nenhum filme cadastrado"})
        }
        res.json({filme: r.rows[0]})
    }catch(erro){
        res.status(500).json(erro)
    }
})//Será necessário colocar o PUT (faixa_etaria) e DELETE = proibir (colocar na faixa etária) ?





























//Associação

router.post("/:id/ator/:idator", async (req, res)=>{
    try{
        let id = req.params.id
        let idAtor = req.params.idator

        const r=await db.query('INSERT INTO filmes_atores(idFilme, idAtor) VALUES ($1, $2) RETURNING *', [id, idAtor])
        if (r.rowCount==0){
            return res.json({msg: "Bixou, nenhuma associação cadastrada"})
        }
        res.json({msg: "Deu certo!"})
    }catch(erro){
        res.status(500).json(erro)
    }
})

router.delete("/:id/ator/:idator", async (req, res)=>{
    try{
        let id = req.params.id
        let idAtor = req.params.idator

        const r=await db.query('DELETE FROM filmes_atores WHERE idFilme=$1 AND idAtor=$2', [id, idAtor])
        if (r.rowCount==0){
            return res.json({msg: "Bixou, esta associação não existe nenhuma associação cadastrada"})
        }
        res.json({msg: "Deu certo!"})
    }catch(erro){
        res.status(500).json(erro)
    }
})




module.exports=router