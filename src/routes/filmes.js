const express=require("express")
const db=require("./db")
const router=express()

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