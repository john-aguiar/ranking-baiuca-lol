# LoL Ranking (Next.js Edition) 🏆

Um sistema completo de ranking para League of Legends, agora migrado para **Next.js 15 (App Router)** e pronto para deploy na **Vercel** com banco de dados **Turso**.

## 🚀 Tecnologias
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router + API Routes)
- **Estilização**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Banco de Dados**: [Turso](https://turso.tech/) (LibSQL/SQLite na nuvem)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Deploy**: [Vercel](https://vercel.com/)

## ⚙️ Configuração Local

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Banco de Dados Local**:
   O projeto usará um arquivo `local.db` automaticamente se nenhuma variável de ambiente for definida.

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## 🌍 Deploy na Vercel + Turso

Para que os dados persistam após o deploy na Vercel, você deve usar o Turso:

### 1. Configurar Turso
1. Crie uma conta no [Turso](https://turso.tech/).
2. Crie um novo banco de dados (ex: `lol-ranking`).
3. Obtenha a **URL** (`libsql://...`) e o **Auth Token**.

### 2. Configurar Vercel
1. Conecte seu repositório à Vercel.
2. Nas configurações do projeto, adicione as **Environment Variables**:
   - `TURSO_URL`: A URL do seu banco no Turso.
   - `TURSO_AUTH_TOKEN`: O token de autenticação gerado.
3. Clique em **Deploy**.

## 📁 Estrutura do Projeto
- `src/app`: Rotas da aplicação (Páginas e API).
- `src/components`: Componentes React reutilizáveis.
- `src/lib`: Lógica de conexão com o banco de dados.
- `src/services`: Camada de comunicação com a API local.
- `_deprecated/`: Código original (React+Vite+Express) mantido para referência.

## 📊 Banco de Dados
O sistema utiliza 3 tabelas principais:
- `players`: Gerenciamento de jogadores.
- `matches`: Registro de partidas (data, modo, vencedor).
- `match_players`: Relacionamento entre jogadores e partidas (Time A vs Time B).

---
⭐ Desenvolvido para facilitar o ranking das suas partidas de LoL!
