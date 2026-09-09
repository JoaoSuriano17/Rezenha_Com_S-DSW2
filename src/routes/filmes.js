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

//Get - todos os filmes
router.get("/", async (req, res)=>{
    try{
        const r=await db.query("SELECT * FROM filmes")
        if (r.rowCount==0){
            return res.json({msg:"Nenhum filme cadastrado!"})
        }
        res.json({filmes: r.rows})
    }catch(erro){
        res.status(500).json({msg: erro})
    }
})

//Get - todos os filmes e seus respectivos atores 
router.get("/participa", async (req, res)=>{
    try{
        const r=await db.query("SELECT f.id idFilme, f.titulo, a.id idAtor, a.nome ator, a.nacionalidade FROM filmes_atores fa JOIN atores a ON a.id = fa.idAtor JOIN filmes f ON f.id = fa.idFilme")
        let filmes = []
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

        if (r.rowCount==0){
            return res.status(400).json({msg:"Nenhum filme cadastrado!"});
        }

        res.status(200).json({filmes: filmes.slice(1)});
    }catch(erro){
        res.status(500).json({msg: erro})
    }
})

//Get - todos os filmes e seus respectivas avaliações
router.get("/avaliacoes", async (req,res)=>{
    try{
        const r=await db.query("SELECT titulo, avaliacao FROM resenhas INNER JOIN filmes ON filmes.id=resenhas.idFilme")
        if (r.rowCount==0){
            return res.status(400).json({msg:"Erro, este filme não tem nenhuma avaliação!"});
        }
        res.json({avaliacoes: r.rows})
    }catch(erro){
        res.status(500).json({msg:erro.message})
    }
})

//Get - todos as avaliações de um determinado filme
router.get("/:id/avaliacao", async (req, res)=>{
    try{
        if (!verificarId(req.params.id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }

        const r=await db.query("SELECT id, titulo FROM filmes WHERE id=$1", [req.params.id])
        const r2=await db.query("SELECT idUsuario, avaliacao FROM resenhas WHERE idFilme=$1", [req.params.id])

        if(r.rowCount==0){
            return res.json({msg:"Não existe nenhum existe nenhum filme com esse id!"})
        }else if (r2.rowCount==0){
            return res.json({msg:"Este filme não tem nenhuma avaliação!"})
        }

        res.json({id: r.rows[0].id, titulo: r.rows[0].titulo, avaliacoes: r2.rows})
    }catch(erro){
        res.status(500).json(erro.message)
    }
})

//Get - todos os filmes e suas respectivas resenhas
router.get("/resenhas", async(req,res)=>{
    try{
        const r=await db.query("SELECT idUsuario, titulo, resenha FROM resenhas INNER JOIN filmes ON filmes.id=resenhas.idFilme")
        if (r.rowCount==0){
            return res.status(400).json({msg:"Não existe nenhum filme cadastrado! Conjunto de dados está vazio!"});
        }

        res.json({resenhas: r.rows})
    }catch(erro){
        res.status(500).json({msg:erro.message})
    }
})

//Get - todos as resenhas de um determinado filme
router.get("/:id/resenha", async (req, res)=>{
    try{
        if (!verificarId(req.params.id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }

        const r=await db.query("SELECT id, titulo FROM filmes WHERE id=$1", [req.params.id])
        const r2=await db.query("SELECT idUsuario, resenha FROM resenhas WHERE idFilme=$1", [req.params.id])

        if(r.rowCount==0){
            return res.json({msg:"Não existe nenhum filme com este id!"})
        }else if (r2.rowCount==0){
            return res.json({msg:"Este filme não tem nenhuma resenha!"})
        }

        let resenhas = []
        for (let obj of r2.rows){
            resenhas.push({idUsuario: obj.idusuario, resenha: obj.resenha})
        }
        res.json({titulo: r.rows[0].titulo, resenhas: resenhas})
    }catch(erro){
        res.status(500).json({msg:erro.message})
    }
})

//Get - filme específico
router.get("/:id", async (req, res)=>{
    try{
        if (!verificarId(req.params.id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }

        const r=await db.query('SELECT * FROM filmes WHERE id=$1',[req.params.id])
        if (r.rowCount==0){
            return res.json({msg: "Não há nenhum filme com este id!"})
        }

        res.json({filme: r.rows[0]})
    }catch(erro){
        res.status(500).json({msg: erro})
    }
})

//Post - adiciona um filme
router.post("/", async (req, res)=>{
    try{
        //Fazer uma sequência de IFs
        if (!req.body.idUsuario){return res.status(400).json({msg: "Usuário também deve ser um parâmetro!"})}



        const r1 = await db.query("SELECT * FROM usuarios WHERE id = $1", [req.body.idUsuario])
        if (r1.rowCount==0){
            return res.status(400).json({msg:"Não existe usuário com este id!"})
        }else if (r1.rows[0].administrador == false){
            return res.status(400).json({msg: "Para adicionar um filme, o usuário deve ser administrador!"})
        }

        const r2=await db.query("SELECT id FROM diretores WHERE id=$1", [req.body.diretor])
        if (r2.rowCount==0){
            return res.status(400).json({msg:"Não existe nenhum diretor com esse id!"})
        }

        const final=await db.query("INSERT INTO filmes(titulo, diretor, sinopse, faixa_etaria, orcamento, duracao) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [req.body.titulo, req.body.diretor, req.body.sinopse, req.body.faixa_etaria, req.body.orcamento, req.body.duracao])
        res.json({msg: "Filme adicionado com sucesso", filme: final.rows[0]})
    }catch(erro){
        res.status(500).json(erro)
    }
})

//Get - mostra um ator de um determinado filme
router.get("/:id/ator/:idAtor", async (req, res)=>{
    try{
        if (!verificarId(req.params.id)) {
            return res.status(400).json({msg: "O id deve ser um número válido"});
        }

        if (!verificarId(req.params.idAtor)) {
            return res.status(400).json({msg: "O id do ator deve ser um número deve ser um número válido"});
        }

        const r=await db.query("SELECT a.* FROM atores a JOIN filmes_atores fa ON fa.idAtor = a.id WHERE fa.idFilme = $1 AND a.id = $2",[req.params.id, req.params.idAtor])
        if (r.rowCount==0){
            return res.status(400).json({msg: "Nenhum filme ou ator com este id!"})
        }
        res.json({filme: r.rows[0]})
    }catch(erro){
        res.status(500).json(erro)
    }
})

//PUT - Dessasociação e associação do diretor em um determinado filme
router.put("/:id/diretor", async (req, res)=>{
    try{
        const id=req.params.id||{};
        if(!id){throw new Error("Id não informado!");}
        const {idUsuario, idDiretor}=req.body||{};
        if(!idUsuario){throw new Error("Id do usuário não informado!");}
        const ru=await db.query("SELECT * FROM usuarios WHERE id=$1 AND administrador=true", [idUsuario]);
        if(ru.rowCount==0){throw new Error("Usuário não existe!");}
        if(!ru.rows[0].administrador){return res.status(403).json({msg:"Usuário não é administrador!"});}
        if(!idDiretor){throw new Error("Id do diretor não informado!");}
        const rc=await db.query("SELECT * FROM diretores WHERE id=$1", [idDiretor]);
        if(rc.rowCount==0){throw new Error("Diretor não existe!");}
        const r=await db.query("UPDATE filmes SET diretor=$1 WHERE id=$2", [idDiretor, id]);
        if(r.rowCount==0){throw new Error("O diretor não foi atualizado.");}
        return res.status(200).json({msg:"Diretor atualizado com sucesso!"});
    }catch(erro){
        return res.status(400).json({msg:erro.message});
    }
});

//Post - adiciona um ator a um determinado filme
router.post("/:id/ator/:idator", async (req, res)=>{
    try{
        //Testar se existe filme com id!

        let id = req.params.id
        let idAtor = req.params.idator
        const {idUsuario} = req.body
        
        if (!verificarId(id)) {
            return res.status(400).json({msg: "O id do filme deve ser um número válido"});
        }

        if (!verificarId(idAtor)) {
            return res.status(400).json({msg: "O id do ator deve ser um número válido"});
        }

        if (!idUsuario){return res.status(400).json({msg: "O usuário deve ser um parâmetro!"})}
        const r1 = await db.query("SELECT * FROM usuarios WHERE id = $1", [idUsuario])
        if (r1.rowCount==0){
            return res.status(400).json({msg:"Não existe usuário com este id!"})
        }else if (r1.rows[0].administrador == false){
            return res.status(400).json({msg: "Para adicionar um ator a um filme, o usuário deve ser administrador!"})
        }

        const r2 = await db.query("SELECT * FROM filmes_atores WHERE idFilme = $1 AND idAtor = $2", [id, idAtor])
        if (r2.rowCount != 0){
            return res.status(400).json({msg: "Este ator já está adicionado a este filme!"})
        }

        const r=await db.query('INSERT INTO filmes_atores(idFilme, idAtor) VALUES ($1, $2) RETURNING *', [id, idAtor])
        if (r.rowCount==0){
            return res.status(400).json({msg: "A associação não foi cadastrada!"})
        }
        res.json({msg: "Associação realizada com sucesso!"})
    }catch(erro){
        res.status(500).json(erro)
    }
})

//Delte - remove um ator de um determinado filme
router.delete("/:id/ator/:idator", async (req, res)=>{
    try{
        let id = req.params.id
        let idAtor = req.params.idator
        
        if (!verificarId(id)) {
            return res.status(400).json({msg: "O id do filme deve ser um número válido"});
        }

        if (!verificarId(idAtor)) {
            return res.status(400).json({msg: "O id do ator deve ser um número válido"});
        }

        if (!req.body.idUsuario){return res.status(400).json({msg: "O usuário deve ser um parâmetro!"})}
        const r1 = await db.query("SELECT * FROM usuarios WHERE id = $1", [req.body.idUsuario])
        if (r1.rowCount==0){
            return res.status(400).json({msg:"Não existe usuário com este id!"})
        }else if (r1.rows[0].administrador == false){
            return res.status(400).json({msg: "Para remover um ator de um filme, o usuário deve ser administrador!"})
        }

        const r2 = await db.query("SELECT * FROM filmes_atores WHERE idFilme = $1 AND idAtor = $2", [id, idAtor])
        if (r2.rowCount == 0){
            return res.status(400).json({msg: "Este ator não está adicionado a esse filme; portanto, é impossível dissociá-lo!"})
        }

        const r=await db.query('DELETE FROM filmes_atores WHERE idFilme=$1 AND idAtor=$2', [id, idAtor])
        if (r.rowCount==0){
            return res.status(400).json({msg: "Impossível fazer essa dissociação!"})
        }
        res.json({msg: "Dissociação realizada com sucesso!"})
    }catch(erro){
        res.status(500).json(erro)
    }
})

//Delete - remove um filme
router.delete("/:id", async (req, res)=>{
    try{
        let id = req.params.id
        if (!verificarId(id)) {
            return res.status(400).json({msg: "O id do filme deve ser um número válido"});
        }

        if (!req.body.idUsuario){return res.status(400).json({msg: "O usuário deve ser um parâmetro!"})}
        if (!req.body.senha){return res.status(400).json({msg: "A senha do usuário deve ser um parâmetro!"})}

        const r1 = await db.query("SELECT email, senha FROM usuarios WHERE id = $1", [req.body.idUsuario])
        if (r1.rowCount==0){
            return res.status(400).json({msg:"Não existe usuário com este id!"})
        }else if (r1.rows[0].administrador == false){
            return res.status(400).json({msg: "Para remover um filme, o usuário deve ser administrador!"})
        }else if (r1.rows[0].senha != req.body.senha){
            return res.status(400).json({msg: "Senha incorreta!"})
        }

        const r2 = await db.query("SELECT * FROM filmes WHERE id = $1", [id])
        if (r2.rowCount==0){
            return res.json({msg:"Não existe filme com esse id!"})
        }

        const r=await db.query('DELETE FROM filmes WHERE id=$1', [id])
        res.json({msg: "Filme e suas respectivas foram deletadas com sucesso!"})
    }catch(erro){
        res.status(500).json(erro)
    }
})

//Put - alterar alguns atributos do filme
router.put("/:id", async (req, res)=>{
    
    let id = req.params.id
    if (!verificarId(id)) {
        return res.status(400).json({msg: "O id deve ser um número válido"});
    }

    const {idUsuario, titulo, lancamento, sinopse, duracao, orcamento} = req.body

    const r1 = await db.query("SELECT id FROM usuarios WHERE id = $1 AND administrador = TRUE", [idUsuario])
    if (r1.rows.length === 0){
        return res.status(400).json({msg: "Usuário não existente ou não é administrador!"})
    }
    const anterior = await db.query("SELECT * FROM filmes WHERE id =$1", [id])
    if (anterior.rowCount == 0){
        return res.status(400).json({msg: "Não existe filme com esse id!"})
    }
            
    const novoTitulo = titulo ?? anterior.rows[0].titulo;
    const novoLancamento = lancamento ?? anterior.rows[0].lancamento;
    const novaSinopse = sinopse ?? anterior.rows[0].sinopse;
    const novaDuracao = duracao ?? anterior.rows[0].duracao;
    const novoOrcamento = orcamento ?? anterior.rows[0].orcamento;

    const resultado = await db.query("UPDATE filmes SET titulo = $1, lancamento = $2, sinopse = $3, duracao = $4, orcamento = $5 WHERE id = $6 RETURNING *", [novoTitulo, novoLancamento, novaSinopse, novaDuracao, novoOrcamento, id]);
    if (resultado.rows.length === 0) {
        return res.status(404).json({msg: "Erro ao atualizar os dados!"});
    }
    
    res.status(200).json({msg: "Filme atualizado com sucesso", filme: resultado.rows[0] });
});
module.exports=router