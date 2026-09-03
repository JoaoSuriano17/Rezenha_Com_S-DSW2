CREATE DATABASE Rezenha_Com_S;

CREATE TABLE IF NOT EXISTS atores(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(85) NOT NULL,
    nascimento DATE,
    nacionalidade VARCHAR(70),
    descricao TEXT,
    qtde_premios INT DEFAULT 0,

    CONSTRAINT nascimento_CK CHECK (nascimento BETWEEN '1895-12-28T00:00:00Z' AND '2026-09-09T00:00:00Z')/*Primeira exposição pelos irmãos Lumière*/
);

CREATE TABLE IF NOT EXISTS diretores(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(85) NOT NULL,
    nascimento DATE,
    descricao TEXT,
    qtde_premios INT DEFAULT 0,

    CONSTRAINT nascimento_CK CHECK (nascimento BETWEEN '1895-12-28T00:00:00Z' AND '2026-09-09T00:00:00Z')/*Primeira exposição pelos irmãos Lumière*/

);

CREATE TABLE IF NOT EXISTS filmes(
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    diretor INT NOT NULL,
    sinopse TEXT,
    faixa_etaria INT,
    orcamento INT NOT NULL,
    duracao INT NOT NULL,

    CONSTRAINT diretor_FK FOREIGN KEY (diretor) REFERENCES diretores(id)
);

CREATE TABLE IF NOT EXISTS filmes_atores(
    id SERIAL PRIMARY KEY,
    idFilme INT,
    idAtor INT,

    CONSTRAINT ator_FK FOREIGN KEY (idAtor) REFERENCES atores(id),
    CONSTRAINT filme_FK FOREIGN KEY (idFilme) REFERENCES filmes(id)
);


CREATE TABLE IF NOT EXISTS usuarios(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(85) NOT NULL,
    login VARCHAR(85) NOT NULL UNIQUE,
    critico BOOLEAN DEFAULT FALSE,
    administrador BOOLEAN DEFAULT FALSE,
    img TEXT,
    senha VARCHAR(60) NOT NULL,
    email VARCHAR(85) NOT NULL UNIQUE,

    CONSTRAINT login_CK CHECK (login NOT LIKE '% %' AND login NOT LIKE '%,%' AND login NOT LIKE '%;%'),/*Ou seja, sem espaços, vírgulas, ou ponto e vírgula;*/
    CONSTRAINT senha_CK CHECK (senha NOT LIKE '% %'),/*Ou seja, sem espaços*/
    CONSTRAINT email_CK CHECK (email LIKE '%@%.%' AND email NOT LIKE '% %' AND email NOT LIKE '%,%' AND email NOT LIKE '%;%')/*algo@algo.algo*/ /*Ou seja, sem espaços, vírgulas, ou ponto e vírgula;*/
);

CREATE TABLE IF NOT EXISTS resenhas(
    id SERIAL PRIMARY KEY,
    idUsuario INT,
    idFilme INT,
    resenha TEXT,
    avaliacao DECIMAL(5,2),

    CONSTRAINT usuario_FK FOREIGN KEY (idUsuario) REFERENCES usuarios(id),
    CONSTRAINT filme_FK FOREIGN KEY (idFilme) REFERENCES filmes(id)

);

INSERT INTO diretores(nome, nascimento, descricao, qtde_premios) VALUES ('Klebe (falso)', '2020-08-20', 'gnsjdngjsgjsdgnsd', 10);
INSERT INTO diretores(nome, nascimento, descricao, qtde_premios) VALUES ('Kleber Mendonça Filho', '2020-08-20', 'gnsjdngjsgjsdgnsd', 10);

INSERT INTO atores(nome, nascimento, nacionalidade, descricao, qtde_premios) VALUES ('Klaus Kinski', '2020-08-20', 'gnsjdngjsgjsdgnsd', 'gnsjdngjsgjsdgnsd', 10);
INSERT INTO atores(nome, nascimento, nacionalidade, descricao, qtde_premios) VALUES ('Fernanda Tôrrrres', '2020-08-20', 'gnsjdngjsgjsdgnsd', 'gnsjdngjsgjsdgnsd', 10);
INSERT INTO atores(nome, nascimento, nacionalidade, descricao, qtde_premios) VALUES ('Jorge3', '2020-08-20', 'gnsjdngjsgjsdgnsd', 'gnsjdngjsgjsdgnsd', 10);

INSERT INTO usuarios(nome, login, critico, administrador, senha, email) VALUES ('Mateus1', 'Mateus1', TRUE, TRUE, '123', 'm1@gmail.com');
INSERT INTO usuarios(nome, login, critico, administrador, senha, email) VALUES ('Mateus2', 'Mateus2', FALSE, TRUE, '123', 'm2@gmail.com');
INSERT INTO usuarios(nome, login, critico, administrador, senha, email) VALUES ('Mateus3', 'Mateus3', FALSE, TRUE, '123', 'm3@gmail.com');

INSERT INTO filmes(titulo, diretor, sinopse, faixa_etaria, orcamento, duracao) VALUES ('Fitzcarraldo', 1, 'Sujeito empreende na Amazônia', 14, 100000, 130);
INSERT INTO filmes(titulo, diretor, sinopse, faixa_etaria, orcamento, duracao) VALUES ('Agente secreto', 2, 'Sujeito no Nordeste', 16, 100000, 110);
INSERT INTO filmes(titulo, diretor, sinopse, faixa_etaria, orcamento, duracao) VALUES ('Eraserhead', 1, 'Sujeito tem um filho', 18, 700000, 113);

INSERT INTO filmes_atores(idFilme, idAtor) VALUES (1, 1);
INSERT INTO filmes_atores(idFilme, idAtor) VALUES (1, 2);
INSERT INTO filmes_atores(idFilme, idAtor) VALUES (2, 2);
INSERT INTO filmes_atores(idFilme, idAtor) VALUES (2, 3);

INSERT INTO resenhas (idUsuario, idFilme, resenha, avaliacao) VALUES (1, 1, 'Lindo filme, nunca vi.', 099.99);
INSERT INTO resenhas (idUsuario, idFilme, resenha, avaliacao) VALUES (2, 2, 'O agente é evidente. Titulo é falsidade ideológica. Prefiro BTS ou Justin Bieber.', 007.89);
INSERT INTO resenhas (idUsuario, idFilme, resenha, avaliacao) VALUES (1, 2, 'Experiência vertiginosa, contagiante. Recomendo.', 100.00);