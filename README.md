# Projeto Jogos Favoritos - Estágio

Projeto realizando durante o processo seletivo na empresa 
<a href="https://appmasters.io/">App Master</a>
Objetivo do processo seletivo é criar uma API com a API da Steam.
Os requisitos para a construção da API foram descritos abaixo.


## API'S Externa

- [Steam API](https://partner.steamgames.com/doc/home)

## Requisitos básicos

- GET de todos os joogos
- GET de um jogo, com todos os detalhes
- Permitir ao usuário realizar uma busca pelo titulo do jogo

## Requisitos adicionais

- POST para incluir novo favorito, incluindo a nota
- DEL para remover um favorito
- GET para obter os jogos favoritos, com os detalhes de cada jogo
- Receber via header 'user-hash' para saber qual usuário é

## Exceder as expectativas

- Fazer cache dos dados obtidos da API externa, para só ir buscar uma única vez (cada dado)
- Publicar online

## Como usar a API?

Listar Jogos

- **GET: /** - Lista os jogos da Steam 

Query

```bash
http://localhost:3333/
```

- **GET: /:game_id** - Lista um jogo específico buscando pelo ID

Params

```bash
http://localhost:3333/706220
```

Listar Favoritos

- **POST: /favorites** - Lista um jogo específico buscando pelo ID (enviar "user-hash" via header)  
A nota para um jogo favorito deve ser entre 0 e 5

Body

```json
{
  "rating": 5,
  "game_id": 706220
}
```

- **GET: /favorites** - Lista todos os jogos favoritado por um usuário (enviar "user-hash" via header)

Headers

```json
"user-hash": "00000000000000000000000000000000"
```

- **DELETE: /favorites/:game_id** - Desfavorita o jogo de algum usuário (enviar "user-hash" via header)

Params

```bash
http://localhost:3333/706220
```

Headers

```json
"user-hash": "00000000000000000000000000000000"
```

## Biblioteca que manipula o uso da API da Steam (Não testei, mais é uma outra alternativa)

https://github.com/xDimGG/node-steamapi

## Perguntas?
1) A API utiliza algum banco de dados?  
R: não. Foi permitido o uso de banco de dados, porém, foi sugerido que usássemos o armazenamento em memória e em cache.

2) Porque `node-cache` e não `redis`?  
R: Porque sim. Brincadeira... `node-cache` tem uma implementação mais simples, mais acredito que `redis` seja melhor para uma quantidade massiva de dados. 😄

## Conclusão

Sendo esse meu primeiro processo seletivo com teste prático eu particularmente gostei do desafio proposto pela empresa <a href="https://appmasters.io/">App Master</a> pude aprender que alguns projetos não precisam começar com uma arquitetura high-end, sendo assim entregando o projeto dentro do prazo e, caso aja necessidade futuramente implantar uma arquitetura mais robusta.