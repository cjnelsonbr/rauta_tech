# Guia de Configuração - Rauta Tech

## Variáveis de Ambiente Necessárias

Para executar o projeto, você precisa configurar as seguintes variáveis de ambiente:

### 1. **DATABASE_URL** (Obrigatório)
Conexão com o banco de dados MySQL.

**Formato:**
```
mysql://usuario:senha@host:porta/nome_banco
```

**Exemplo:**
```
DATABASE_URL="mysql://rauta_user:minha_senha_segura@localhost:3306/rauta_tech"
```

### 2. **JWT_SECRET** (Obrigatório)
Chave secreta para assinar tokens JWT. Deve ter no mínimo 32 caracteres.

**Como gerar uma chave segura:**

```bash
# No Linux/Mac
openssl rand -base64 32

# No Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Exemplo:**
```
JWT_SECRET="xK8mP2vL9nQ5rT7wJ3bF6hD4sG1cV8zX+yE0aM2nO4p"
```

### 3. **VITE_APP_TITLE** (Recomendado)
Título da aplicação exibido no navegador e painel.

**Exemplo:**
```
VITE_APP_TITLE="Rauta Tech - Assistência Técnica"
```

### 4. **VITE_APP_LOGO** (Recomendado)
URL da logo da aplicação.

**Exemplo:**
```
VITE_APP_LOGO="https://seu-dominio.com/logo.png"
```

### 5. **NODE_ENV** (Recomendado)
Ambiente de execução.

**Valores válidos:**
- `development` - Desenvolvimento local
- `production` - Produção

**Exemplo:**
```
NODE_ENV="production"
```

### 6. **PORT** (Opcional)
Porta em que a aplicação será executada. Padrão: 3000

**Exemplo:**
```
PORT=3000
```

## Criando o Arquivo .env

1. Na raiz do projeto, crie um arquivo chamado `.env`
2. Adicione as variáveis acima com seus valores
3. **NÃO commite este arquivo no Git** (já está no .gitignore)

### Exemplo Completo de .env

```env
# Banco de Dados
DATABASE_URL="mysql://rauta_user:senha_super_segura_123@localhost:3306/rauta_tech"

# JWT
JWT_SECRET="xK8mP2vL9nQ5rT7wJ3bF6hD4sG1cV8zX+yE0aM2nO4p"

# Aplicação
VITE_APP_TITLE="Rauta Tech - Assistência Técnica"
VITE_APP_LOGO="https://seu-dominio.com/logo.png"

# Ambiente
NODE_ENV="production"
PORT=3000
```

## Próximos Passos

1. Configure as variáveis de ambiente acima
2. Execute `pnpm install` para instalar dependências
3. Execute `pnpm db:push` para criar as tabelas do banco
4. Execute `pnpm dev` para desenvolvimento ou `pnpm build && pnpm start` para produção

## Segurança

⚠️ **Importante:**
- Nunca compartilhe seu `JWT_SECRET`
- Nunca commite o arquivo `.env` no repositório
- Use senhas fortes para o banco de dados
- Altere a senha padrão do admin imediatamente após o primeiro acesso
- Use HTTPS em produção

## Primeiro Acesso

Após configurar e iniciar a aplicação:

1. Acesse `/admin` no seu navegador
2. Use as credenciais padrão:
   - **Email**: admin@rauta.tech
   - **Senha**: admin123456
3. **Altere a senha imediatamente!**

## Troubleshooting

### Erro: "Cannot find module 'mysql2'"
```bash
# Reinstale as dependências
pnpm install
```

### Erro: "Database connection failed"
- Verifique se MySQL está rodando
- Verifique as credenciais no `.env`
- Verifique se o banco de dados existe

### Erro: "Port 3000 is already in use"
```bash
# Use outra porta
PORT=3001 pnpm dev
```

## Suporte

Para dúvidas, entre em contato: **27 99768-1466**

