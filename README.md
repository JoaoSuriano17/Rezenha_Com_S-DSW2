# 🍅 Rezenha com S 🍅

O arquivo HTML, localizado em http://localhost:3000/, apresenta uma documentação visual do sistema **Rezenha Com S**, organizando seus principais endpoints. A documentação está dividida em cinco módulos: **Usuários, Filmes, Resenhas, Atores e Diretores**.

Para cada endpoint, são apresentados o **método HTTP** (`GET`, `POST`, `PUT` ou `DELETE`), sua finalidade, os dados necessários para realizar a requisição e um exemplo do resultado retornado pela API.

**Funcionamento básico do sistema**
- O Rezenha Com S é um sistema de gerenciamento de filmes que permite o cadastro de usuários, filmes, atores, diretores e resenhas. Os usuários podem consultar as informações cadastradas e, dependendo de suas permissões, realizar diferentes operações no sistema.

**Usuário 👤**

O sistema possui três níveis de usuário:
- Usuário comum: pode realizar consultas e publicar, alterar ou excluir suas próprias resenhas.
- Crítico: possui as mesmas funcionalidades básicas de um usuário comum, mas suas resenhas são identificadas como resenhas críticas, permitindo diferenciá-las das resenhas públicas dos demais usuários.
- Administrador: possui permissões de gerenciamento do sistema, podendo cadastrar, alterar e excluir filmes, atores e diretores, além de gerenciar as associações entre atores e filmes e alterar informações de filmes.
  
**Filmes 🎥**
- Os filmes possuem informações como título, diretor, sinopse, faixa etária, orçamento e duração. O sistema permite consultar os filmes cadastrados, seus atores, avaliações e resenhas.
- Somente administradores podem cadastrar ou alterar filmes, alterar seus diretores, associar ou remover atores e excluir filmes.

**Atores e diretores 🎭🎬**
- O sistema mantém informações sobre os atores e diretores, como nome, data de nascimento, descrição, nacionalidade (no caso dos atores) e quantidade de prêmios.
- O administrador é responsável pelo cadastro, alteração e exclusão dessas pessoas. Também é possível consultar suas participações e os filmes dirigidos ou nos quais os atores participam.

**Resenhas e avaliações 📝⭐**
- Os usuários podem publicar uma resenha associada a um filme, contendo um texto e uma avaliação de 0 a 100.
- Cada usuário pode alterar ou excluir apenas suas próprias resenhas. As resenhas são classificadas de acordo com o tipo de usuário, podendo ser consultadas como resenhas públicas ou resenhas de críticos.
