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

module.exports = router;