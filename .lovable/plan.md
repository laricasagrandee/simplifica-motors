

## Plano: Adicionar campo de telefone no cadastro rápido de cliente

### Problema
1. O cadastro rápido só pede o nome — o cliente é salvo sem telefone, impossibilitando envio de WhatsApp (orçamento e aviso de pronto).
2. Faz sentido ter pelo menos a opção de informar o telefone no fluxo rápido, sem ser obrigatório.

### Mudanças

**`src/pages/OSRapidaPage.tsx`**
- Adicionar estado `novoClienteTelefone`
- No formulário de "Novo Cliente" (onde hoje só tem o campo Nome), adicionar um segundo campo de telefone com máscara, placeholder "(11) 99999-9999"
- Passar o telefone no `criarCliente.mutateAsync({ nome, cpf_cnpj: '', telefone: novoClienteTelefone })`
- Layout: os dois inputs empilhados (nome em cima, telefone embaixo), botões Criar/× ao lado do telefone
- Telefone continua **não obrigatório** — o botão "Criar" só exige nome preenchido

### O que não muda
- Nenhuma mudança no banco, hooks ou validações
- Cliente rápido continua sendo cadastro mínimo (nome), mas agora com a chance de já incluir telefone
- Filtro `apenasCompletos` já existe e já esconde clientes sem telefone/CPF das listas gerais — isso não precisa ser alterado

