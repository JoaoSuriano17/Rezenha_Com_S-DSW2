const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.json());
app.use(cors());

app.use("/hello", require("./routes/rota"));
app.use("/diretores", require("./routes/diretores"));
app.use("/usuarios", require("./routes/usuarios"));
app.use("/filmes", require("./routes/filmes"));
app.use("/atores", require("./routes/atores"));
app.use("/participa", require("./routes/participa"));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.listen(3000, () => {
    console.log(`Servidor executando em http://localhost:3000`);
});