# Plataforma de Empregos PIE - Frontend

Cliente web da plataforma de empregos. Este guia e voltado para desenvolvedores que precisam entender a organizacao do frontend, executar a aplicacao localmente e contribuir sem quebrar a integracao com a API.

## Objetivo do projeto

O frontend entrega a experiencia web para:

- login de candidatos e empresas;
- cadastro de novos usuarios;
- dashboard autenticado por perfil;
- criacao e edicao de vagas;
- candidatura em vagas;
- consulta de perfil, sobre e candidaturas.

## Stack

- Next.js `16` com App Router
- React `19`
- TypeScript `5`
- React Query para mutacoes e sincronizacao com a API
- Axios para comunicacao HTTP
- Zod para validacao
- Tailwind CSS `4`
- componentes utilitarios em `src/components/ui`

## Estrutura do codigo

Pastas principais:

- `src/app/`: rotas e paginas do App Router.
- `src/components/`: telas e componentes reutilizaveis.
- `src/components/ui/`: primitives de interface.
- `src/hooks/`: mutacoes, schemas e logica reaproveitavel.
- `src/lib/`: utilitarios como persistencia do token.
- `src/app/axios/instance.ts`: cliente HTTP central com interceptors.

## Organizacao das rotas

Rotas relevantes atualmente:

- `/`: tela de login.
- `/signup/seeker`: cadastro de candidato.
- `/signup/business`: cadastro de empresa.
- `/dashboard/seeker`: area autenticada do candidato.
- `/dashboard/seeker/profile`: perfil do candidato.
- `/dashboard/seeker/about`: pagina institucional.
- `/dashboard/seeker/applications`: historico de candidaturas.
- `/dashboard/business`: area autenticada da empresa.
- `/dashboard/business/profile`: perfil da empresa.
- `/dashboard/business/about`: pagina institucional.
- `/dashboard/business/candidates`: candidatos vinculados a vagas.
- `/dashboard/business/jobs/new`: criacao de vaga.
- `/dashboard/business/jobs/[id]/edit`: edicao de vaga.

## Integracao com a API

A integracao fica centralizada em `src/app/axios/instance.ts`.

Comportamentos importantes:

- `NEXT_PUBLIC_API_URL` define a base da API.
- o token JWT e lido do armazenamento local antes de cada requisicao.
- respostas `401` limpam a sessao e redirecionam o usuario para `/`.

Os hooks em `src/hooks/` encapsulam chamadas de autenticacao, perfil e vagas. Ao criar novas integracoes, mantenha esse padrao em vez de chamar `axios` diretamente dentro das telas.

## Pre-requisitos

- Node.js 20+ ou 22+
- npm ou yarn
- backend em execucao

## Configuracao do ambiente

Existe um arquivo de exemplo em `.env.example`:

```bash
cp .env.example .env.local
```

Conteudo esperado:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Se o backend estiver em outra porta ou host, ajuste essa variavel.

## Execucao local

Instalar dependencias:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Aplicacao disponivel em `http://localhost:3000`.

## Build e verificacao

Comandos principais:

```bash
npm run lint
npm run build
```

Hoje o projeto possui lint configurado e nao possui uma suite de testes automatizados dedicada no frontend. Se voce alterar logica critica, valide pelo menos:

- autenticacao;
- navegacao entre dashboards;
- criacao e edicao de vagas;
- fluxo de candidatura;
- tratamento de expiracao de sessao.

## Fluxo interno esperado

Ao implementar uma funcionalidade nova, siga a divisao atual:

1. crie ou ajuste a rota em `src/app/...`;
2. mova logica de requisicao para `src/hooks/...` quando houver integracao com API;
3. reuse `src/app/axios/instance.ts` para chamadas HTTP;
4. mantenha componentes de tela em `src/components/...`;
5. coloque validacoes com Zod em schemas ou hooks relacionados.

## Convencoes para contribuicao

- nao duplique chamadas HTTP entre componentes;
- preserve a separacao entre pagina, tela e hook;
- mantenha nomes de rotas e perfis consistentes com o backend;
- trate estados de erro da API de forma explicita;
- valide manualmente os fluxos autenticados apos qualquer alteracao relevante.

## Docker

O projeto possui `Dockerfile` e `docker-compose.yml` para empacotamento da aplicacao. A imagem usa Node 22 Alpine e expoe a porta `3000` no processo final.

## Como contribuir

Fluxo sugerido:

1. crie uma branch para a alteracao;
2. implemente a mudanca respeitando a organizacao `app` + `components` + `hooks`;
3. rode `npm run lint` e `npm run build`;
4. teste a integracao com o backend real;
5. abra a contribuicao descrevendo o fluxo alterado, impactos visuais e requisitos de ambiente.
