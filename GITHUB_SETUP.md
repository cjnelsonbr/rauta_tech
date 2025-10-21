# Como Fazer Upload no GitHub

## 📋 Pré-requisitos

- Conta no GitHub
- Git instalado no seu computador
- Chave SSH ou token de acesso configurado

## 🚀 Passo a Passo

### 1. Criar um Novo Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "+" → "New repository"
3. Nome do repositório: `rauta_tech`
4. Descrição: "Sistema de gerenciamento de assistência técnica de celulares"
5. Selecione "Private" (privado) ou "Public" (público)
6. **NÃO** selecione "Initialize this repository with a README"
7. Clique em "Create repository"

### 2. Preparar o Repositório Local

```bash
# Ir para o diretório do projeto
cd /caminho/para/rauta_tech

# Inicializar git (se ainda não estiver)
git init

# Adicionar todos os arquivos
git add .

# Criar primeiro commit
git commit -m "Initial commit: Rauta Tech - Sistema de Assistência Técnica"
```

### 3. Conectar ao Repositório GitHub

Copie os comandos do GitHub (após criar o repositório) e execute:

```bash
# Adicionar remote (substitua SEU_USUARIO e SEU_REPOSITORIO)
git remote add origin https://github.com/SEU_USUARIO/rauta_tech.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push para o GitHub
git push -u origin main
```

### 4. Verificar Upload

1. Acesse seu repositório no GitHub
2. Verifique se todos os arquivos foram enviados
3. Confirme que `.env` **NÃO** foi enviado (deve estar no .gitignore)

## 📝 Estrutura do Repositório

Após o upload, seu repositório terá:

```
rauta_tech/
├── client/              # Frontend React
├── server/              # Backend Express
├── drizzle/             # Migrações de banco de dados
├── shared/              # Código compartilhado
├── package.json         # Dependências
├── README.md            # Documentação principal
├── SETUP.md             # Guia de configuração
├── GITHUB_SETUP.md      # Este arquivo
├── .gitignore           # Arquivos ignorados
└── .env.example         # Exemplo de variáveis (OPCIONAL)
```

## 🔐 Segurança

⚠️ **IMPORTANTE:**

- ✅ `.env` está no `.gitignore` (não será enviado)
- ✅ `node_modules/` está no `.gitignore` (não será enviado)
- ✅ Senhas e chaves secretas não estão no repositório
- ✅ Arquivo `.env.example` mostra quais variáveis são necessárias

## 🔄 Clonar em Outra Máquina

Para instalar em uma máquina virtual ou outro computador:

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/rauta_tech.git
cd rauta_tech

# Instalar dependências
pnpm install

# Criar arquivo .env com suas configurações
nano .env

# Executar migrações
pnpm db:push

# Iniciar em desenvolvimento
pnpm dev

# Ou em produção
pnpm build
pnpm start
```

## 📦 Atualizações Futuras

Para fazer novos commits e push:

```bash
# Ver status
git status

# Adicionar mudanças
git add .

# Criar commit
git commit -m "Descrição das mudanças"

# Fazer push
git push origin main
```

## 🆘 Problemas Comuns

### Erro: "fatal: not a git repository"
```bash
git init
git remote add origin https://github.com/SEU_USUARIO/rauta_tech.git
```

### Erro: "Permission denied (publickey)"
Configure sua chave SSH no GitHub:
1. Gere uma chave: `ssh-keygen -t ed25519 -C "seu@email.com"`
2. Adicione em GitHub: Settings → SSH and GPG keys → New SSH key
3. Cole a chave pública

### Erro: "fatal: 'origin' does not appear to be a 'git' repository"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/rauta_tech.git
```

## 📚 Referências

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [SSH Key Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

## 📞 Suporte

Para dúvidas, entre em contato: **27 99768-1466**

---

**Pronto para fazer upload? Siga os passos acima!** 🚀

