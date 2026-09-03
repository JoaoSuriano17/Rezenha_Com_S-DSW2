const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
	try{
		const r=await db.query("SELECT id, nome, email, critico, administrador, img FROM usuarios");
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
		const id=req.params.id||{};
		if(!id){throw new Error("Id não identificado!");}
		const r=await db.query("SELECT id, nome, email, critico, administrador, img FROM usuarios WHERE id=$1", [id]);
		if(r.rowCount==0){
			res.status(400).json({msg:"Não há usuários."});
		}
		res.status(200).json({usuario:r.rows[0]});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
router.post("/", async (req, res) => {
	try{
		const {nome, critico, administrador, img, senha, email}=req.body||{};
		if(!nome){throw new Error("Nome não identificado!");}
		if(!senha){throw new Error("Senha não identificada!");}
		if(!email){throw new Error("E-mail não identificado!");}
		const criticoBool=(critico==1234)?true:false;//código de crítico:1234
		const administradorBool=(administrador==5678)?true:false;//código de administrador:5678
		const r=await db.query("INSERT INTO usuarios (nome, critico, administrador, img, senha, email) VALUES ($1, $2, $3, $4, $5, $6)", [nome, criticoBool, administradorBool, img, senha, email]);
		if(r.rowCount==0){
			res.status(400).json({msg:"Não foi adicionado usuário."});
		}
		res.status(200).json({msg:"Usuário adicionado com sucesso!"});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
router.put("/:id", async (req, res) => {
	try{
		const id=req.params.id||{};
		const rp=await db.query("SELECT * FROM usuarios WHERE id=$1", [id]);
		if(rp.rowCount==0){
			res.status(400).json({msg:"Usuário não encontrado."});
		}
		if(!id){throw new Error("Id não especificado!");}
		
		if(req.body.nome){console.log("Nfdabusduid")}

		let nome;
		if(req.body.nome){
			nome=req.body.nome;
			let r=await db.query("UPDATE usuarios SET nome=$1 WHERE id=$2", [nome, id]);
			if(r.rowCount==0){
				res.status(400).json({msg:"Não foi alterado o nome do usuário."});
			}
		}
		let critico;
		if(req.body.critico){
			critico=(req.body.critico==1234)?true:false;
			let r=await db.query("UPDATE usuarios SET critico=$1 WHERE id=$2", [critico, id]);
			if(r.rowCount==0){
				res.status(400).json({msg:"Não foi alterado o estado de crítico do usuário."});
			}
		}
		let administrador;
		if(req.body.administrador){
			administrador=(req.body.administrador==5678)?true:false;
			let r=await db.query("UPDATE usuarios SET administrador=$1 WHERE id=$2", [administrador, id]);
			if(r.rowCount==0){
				res.status(400).json({msg:"Não foi alterado o estado de administrador do usuário."});
			}
		}
		let img;
		if(req.body.img){
			img=req.body.img;
			let r=await db.query("UPDATE usuarios SET img=$1 WHERE id=$2", [img, id]);
			if(r.rowCount==0){
				res.status(400).json({msg:"Não foi alterado a imagem do usuário."});
			}
		}
		let senha;
		if(req.body.senha){
			senha=req.body.senha;
			let r=await db.query("UPDATE usuarios SET senha=$1 WHERE id=$2", [senha, id]);
			if(r.rowCount==0){
				res.status(400).json({msg:"Não foi alterado a senha do usuário."});
			}
		}
		let email;
		if(req.body.email){
			email=req.body.email;
			let r=await db.query("UPDATE usuarios SET email=$1 WHERE id=$2", [email, id]);
			if(r.rowCount==0){
				res.status(400).json({msg:"Não foi alterado o e-mail do usuário."});
			}
		}
		res.status(200).json({msg:"Atualização realizada com sucesso."});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});
router.delete("/:id", async (req, res) => {
	try{
		const id=req.params.id||{};
		if(!id){throw new Error("Id não identificado!");}
		const r=await db.query("DELETE * FROM usuarios WHERE id=$1", [id]);
		if(r.rowCount==0){
			res.status(400).json({msg:"Não foram apagados usuários."});
		}
		res.status(200).json({msg:"Usuário removido com sucesso!"});
	}catch(erro){
		res.status(400).json({msg:erro});
	}
});

router.post("/login", async (req, res)=>{
	try{
		const {email, senha}=req.body||{};
		if(!email){throw new Error("E-mail não infromado.");}
		if(!senha){throw new Error("Senha não informada.");}
		const r=await db.query("SELECT id, nome, email, critico, administrador, img FROM usuarios WHERE email=$1 AND senha=$2", [email, senha]);
		res.status(200).json({usuario:r.rows[0]});
	}
	catch(erro){
		res.status(400).json({msg:erro});
	}
});
module.exports = router;