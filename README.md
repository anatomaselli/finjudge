# FinJudge - Projeto Back-End (Univille)

## 🔍 Sobre o Projeto
O **FinJudge** é um assistente financeiro automatizado que integra **WhatsApp, banco de dados e API** em um ambiente completo de backend. Desenvolvido como **trabalho da disciplina de Desenvolvimento Back-End da Univille**, o projeto demonstra boas práticas de arquitetura, deploy e integração de serviços modernos.

Ele permite o gerenciamento de dados financeiros e comunicação direta com o usuário via **WhatsApp Web**, utilizando Node.js, Express e PostgreSQL (Supabase).

---

## 🛠️ Configuração do Ambiente Local

### 1. Clonar o Repositório
```bash
git clone https://github.com/anatomaselli/finjudge
cd finjudge/backend
```

### 2. Instalar o Node.js e NVM
```powershell
winget install CoreyButler.NVMforWindows
nvm install 20.7.0
nvm use 20.7.0
```

### 3. Instalar Dependências do Projeto
```bash
npm install
npm i whatsapp-web.js qrcode-terminal puppeteer
```

### 4. Configurar o Arquivo .env
Crie o arquivo `.env` dentro da pasta **backend/** e defina as variáveis:

```env
PORT=3000
PGHOST=db.<id_do_projeto>.supabase.co
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=<sua_senha>
PGSSLMODE=require
SUPABASE_URL=https://<id_do_projeto>.supabase.co
```

> ⚠️ O arquivo `.env` deve ser **ignorado no GitHub**. Adicione a linha `.env` ao arquivo `.gitignore`.

### 5. Executar o Servidor e o Bot
```bash
node server.js
node wpp.js
```

O servidor iniciará em `http://localhost:3000` e o bot abrirá um QR Code para conectar o WhatsApp.

---

## 🛡️ Infraestrutura e Ferramentas Utilizadas

### **Supabase**  
O Supabase é usado como **banco de dados PostgreSQL gerenciado**, fornecendo conexão segura via SSL e interface para gerenciar tabelas, dados e autenticação.

- Utilizado para armazenar dados de leads, usuários e informações do assistente financeiro.
- Integração feita via variáveis de ambiente e módulo `pg` no Node.js.

### **Render**  
O Render hospeda o **backend (API REST)** do FinJudge.

- Conectado diretamente ao repositório do GitHub.  
- Realiza build e deploy automáticos.
- O app roda online em: [https://finjudge-backend.onrender.com](https://finjudge-backend.onrender.com)

### **Netlify**  
O Netlify hospeda o **frontend** estático (interface básica de interação com a API).

- Configurado para publicar a pasta `frontend/`.
- API configurada em `script.js` para se comunicar com o backend hospedado no Render.

URL de deploy: [https://wonderful-kelpie-4f2cb1.netlify.app](https://wonderful-kelpie-4f2cb1.netlify.app)

---

## 📂 Estrutura do Projeto
```
finjudge/
├── backend/
│   ├── server.js
│   ├── wpp.js
│   ├── db.js
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
.gitignore
```

---

## 🔹 Status Atual do Projeto
| Etapa                            | Status        |
|----------------------------------|---------------|
| Backend (Render)                 | Online        |
| Banco de Dados (Supabase)        | Conectado     |
| Variáveis de ambiente (.env)    | Configuradas  |
| Frontend (Netlify)               | Online        |
| Integração frontend/backend     | Funcionando   |
| Chatbot WhatsApp (whatsapp-web.js) | Em operação |

---

## 💡 Considerações Finais
Este projeto integra **diversos serviços modernos** (Supabase, Render, Netlify e WhatsApp Web API) para demonstrar um ambiente completo de backend e comunicação entre serviços.

Seu desenvolvimento faz parte da disciplina de **Back-End na Universidade da Região de Joinville (Univille)** e exemplifica práticas reais de deploy, integração e gestão de dados na nuvem.

