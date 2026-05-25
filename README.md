# Plataforma de Empregos PIE - Interface Frontend

Este é o cliente web da Plataforma de Empregos PIE. Uma interface moderna, rápida e responsiva construída com **Next.js** e **Tailwind CSS**, que consome a API de recrutamento.

## 🛠️ Tecnologias e Bibliotecas

* **Framework:** Next.js (React) com App Router
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS & componentes Shadcn UI
* **Comunicação com a API:** Axios
* **Validação de Formulários:** Zod

## 💻 Telas e Fluxos Implementados

* **Público:** Página Inicial e Login unificado.
* **Registo:** Páginas dedicadas para Candidatos e Empresas.
* **Dashboard da Empresa:** Criação de vagas, edição de vagas e visualização de candidatos inscritos.
* **Dashboard do Candidato:** Exploração de vagas disponíveis no mercado, candidatura com um clique e acompanhamento de status.

## 🔧 Instalação e Execução

Pré-requisitos: Node.js (versão 18 ou superior) e um gestor de pacotes (npm ou yarn).

Passo 1: Instalar as Dependências
Instale todos os pacotes necessários definidos no projeto:
    npm install

Passo 2: Configurar as Variáveis de Ambiente
Crie um ficheiro chamado .env.local na raiz desta pasta e configure o endereço base da sua API Laravel:
    NEXT_PUBLIC_API_URL=http://localhost:8000/api

Passo 3: Iniciar o Servidor de Desenvolvimento
Execute o comando para levantar o Next.js localmente:
    npm run dev

O frontend estará acessível no seu navegador através do endereço: http://localhost:3000

## 📂 Arquitetura do Código

* src/app/: Estrutura de rotas baseada em pastas do Next.js (páginas de login, registo e os dashboards).
* src/components/: Componentes visuais da aplicação (ecrãs completos e elementos de UI reutilizáveis).
* src/hooks/: Custom hooks que isolam a lógica de negócio e mutações de dados com a API.
* src/lib/: Utilitários gerais e configuração da instância do Axios.