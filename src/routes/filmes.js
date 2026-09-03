const express=require("express")
const db=require("../db")
const router=express()

//Get - geral para filmes
router.get("/", async (req, res)=>{
    try{
        const r=await db.query("SELECT * FROM filmes")
        if (r.rowCount==0){
            return res.json("Bixou, nenhum filme cadastrado")
        }
        res.json(r.rows)
    }catch(erro){
        res.json(erro)
    }
})

//GET que mostra todos os filmes e seus atores
router.get("/participa", async (req, res)=>{
    try{
        const r=await db.query("SELECT f.id idFilme, f.titulo, a.id idAtor, a.nome ator, a.nacionalidade FROM filmes_atores fa JOIN atores a ON a.id = fa.idAtor JOIN filmes f ON f.id = fa.idFilme")
        //res.send(r.rows)

        let filmes = []
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
        }



        //Adicionar o primeira autor -> 

        
            
        res.json(filmes)

        if (r.rowCount==0){
            return res.json("Bixou, nenhum filme cadastrado")
        }
        res.json(r.rows)
    }catch(erro){
        res.json(erro)
    }
})

router.get("/:id", async (req, res)=>{
    try{
        const r=await db.query('SELECT * FROM filmes WHERE id=$1',[req.params.id])
        if (r.rowCount==0){
            return res.json("Bixou, nenhum filme cadastrado")
        }
        res.json(r.rows)
    }catch(erro){
        res.json(erro)
    }
})

router.post("/", async (req, res)=>{
    try{
        const r=await db.query("INSERT INTO filmes(titulo, diretor, sinopse, orcamento, duracao) VALUES($1, $2, $3, $4, $5)", [req.body.titulo, req.body.diretor, req.body.sinopse, req.body.orcamento, req.body.duracao])
        res.json("Filme adicionado com sucesso")
    }catch(erro){
        res.json(erro)
    }
})

module.exports=router