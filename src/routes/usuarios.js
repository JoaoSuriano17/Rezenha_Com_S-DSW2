const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
	try{
		const r=await db.query("SELECT * FROM usuarios");
		if(r.rowCount==0){
			res.status(400).json({msg:"Não há usuários."});
		}
		res.status(200).json({usuarios:r.rows});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
router.get("/:id", async (req, res) => {
	try{
		const {id}=req.params.id||{};
		if(!id){throw new Error("Id não identificado!");}
		const r=await db.query("SELECT * FROM usuarios WHERE id=$1", [id]);
		if(r.rowCount==0){
			res.status(400).json({msg:"Não há usuários."});
		}
		res.status(200).json({usuarios:r.rows});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
router.post("/", async (req, res) => {
	/*
    nome VARCHAR(85) NOT NULL,
    login VARCHAR(85) NOT NULL UNIQUE,
    critico BOOLEAN DEFAULT FALSE,
    administrador BOOLEAN DEFAULT FALSE,
    img TEXT DEFAULT NULL,
    senha VARCHAR(60) NOT NULL,
    email VARCHAR(85) NOT NULL UNIQUE
	*/
	try{
		const {nome, login, critico, administrador, img, senha, email}=req.body||{};
		if(!nome){throw new Error("Nome não identificado!");}
		if(!login){throw new Error("Login não identificado!");}
		if(!senha){throw new Error("Senha não identificada!");}
		if(!email){throw new Error("E-mail não identificado!");}
		const r=await db.query("INSERT INTO usuarios (nome, login, critico, administrador, img, senha, email) VALUES ($1, $2, $3, $4, $5, $6, $7)", [nome, login, critico, administrador, img, senha, email]);
		if(r.rowCount==0){
			res.status(400).json({msg:"Não foi adicionado usuário."});
		}
		res.status(200).json({usuarios:r.rows});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
//put falta

/*
router.put("/:id", async (req, res) => {
	try{
		const {id}=req.params.id||{};
		const r=await db.query("SELECT * FROM usuario WHERE id=$1", [id]);
		if(r.rowCount==0){
			res.status(400).json({msg:"Usuário não encontrado."});
		}
		if(!id){throw new Error("Id não especificado!");}
		const {nome}=req.body.nome||{r.usuarios[0].nome}
		if(!r.usuarios.nome){throw new Error("Nome não identificado!");}
		if(!login){throw new Error("Login não identificado!");}
		if(!critico){throw new Error("Login não identificado!");}
		if(!administrador){throw new Error("Login não identificado!");}
		if(!img){throw new Error("Login não identificado!");}
		if(!senha){throw new Error("Senha não identificada!");}
		if(!email){throw new Error("E-mail não identificado!");}
		const r2=await db.query("INSERT INTO usuario (nome, login, critico, administrador, img, senha, email) VALUES ($1, $2, $3, $4, $5, $6, $7)", [nome, login, critico, administrador, img, senha, email]);
		if(r2.rowCount==0){
			res.status(400).json({msg:"Não foi adicionado usuário."});
		}
		res.status(200).json({usuarios:r.rows});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
*/

router.delete("/:id", async (req, res) => {
	try{
		const {id}=req.params.id||{};
		if(!id){throw new Error("Id não identificado!");}
		const r=await db.query("DELETE * FROM usuarios WHERE id=$1", [id]);
		if(r.rowCount==0){
			res.status(400).json({msg:"Não foram apagados usuários."});
		}
		res.status(200).json({usuarios:r.rows});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
module.exports = router;
