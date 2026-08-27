CREATE DATABASE Rezenha_Com_S;

CREATE TABLE IF NOT EXISTS atores(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(85) NOT NULL,
    nascimento DATE,
    nacionalidade VARCHAR(70),
    descricao TEXT,
    qtde_premios INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS diretor(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(85) NOT NULL,
    nascimento DATE,
    descricao TEXT,
    qtde_premios INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS filmes(
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    diretor INT NOT NULL,
    sinopse TEXT,
    faixa_etaria INT,
    orcamento INT NOT NULL,
    duracao INT NOT NULL,

    CONSTRAINT diretor_FK FOREIGN KEY (diretor) REFERENCES diretor(id)
);

CREATE TABLE IF NOT EXISTS filmes_atores(
    id SERIAL PRIMARY KEY,
    idFilme INT,
    idAtor INT,

    CONSTRAINT ator_FK FOREIGN KEY (idAtor) REFERENCES atores(id),
    CONSTRAINT filme_FK FOREIGN KEY (idFilme) REFERENCES filmes(id)
);


CREATE TABLE IF NOT EXISTS usuario(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(85) NOT NULL,
    login VARCHAR(85) NOT NULL UNIQUE,
    critico BOOLEAN DEFAULT FALSE,
    administrador BOOLEAN DEFAULT FALSE,
    img TEXT,
    senha CHAR(60) NOT NULL,
    email VARCHAR(85) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS resenha(
    id SERIAL PRIMARY KEY,
    idUsuario INT,
    idFilme INT,
    resenha TEXT,
    avaliacao DECIMAL(5,2),

    CONSTRAINT usuario_FK FOREIGN KEY (idUsuario) REFERENCES usuario(id),
    CONSTRAINT filme_FK FOREIGN KEY (idFilme) REFERENCES filmes(id)

);

INSERT INTO diretor(nome, nascimento, descricao, qtde_premios) VALUES ('Kleber1', '2020-08-20', 'gnsjdngjsgjsdgnsd', 10);
INSERT INTO diretor(nome, nascimento, descricao, qtde_premios) VALUES ('Kleber2', '2020-08-20', 'gnsjdngjsgjsdgnsd', 10);

INSERT INTO atores(nome, nascimento, nacionalidade, descricao, qtde_premios) VALUES ('Jorge1', '2020-08-20', 'gnsjdngjsgjsdgnsd', 'gnsjdngjsgjsdgnsd', 10);
INSERT INTO atores(nome, nascimento, nacionalidade, descricao, qtde_premios) VALUES ('Jorge2', '2020-08-20', 'gnsjdngjsgjsdgnsd', 'gnsjdngjsgjsdgnsd', 10);
INSERT INTO atores(nome, nascimento, nacionalidade, descricao, qtde_premios) VALUES ('Jorge3', '2020-08-20', 'gnsjdngjsgjsdgnsd', 'gnsjdngjsgjsdgnsd', 10);
