const listaContatos = document.getElementById("lista-contatos");
const btnAdd = document.getElementById("add-contato");
const btnEnviarTodos = document.getElementById("enviar-todos");

const chkAvaliacao = document.getElementById("chk-avaliacao");
const chkEncerramento = document.getElementById("chk-encerramento");
const txtMensagem = document.getElementById("mensagem");

let contatos = [];

/* ==========================
   CHECKBOX: APENAS UMA OPÇÃO
   ========================== */
chkAvaliacao.addEventListener("change", () => {
    if (chkAvaliacao.checked) {
        chkEncerramento.checked = false;
        txtMensagem.value =
`Assunto: Lembrete de Avaliação de Suporte - Softem

Olá, tudo bem?
Sou o [Nome do Tecnico], da equipe de Suporte da Softem. Notei que a avaliação do nosso último atendimento consta como pendente.
O formulário foi encaminhado para [e-mail do cliente]. Caso não o encontre na caixa de entrada, poderia verificar se caiu na caixa de Spam?
Sua opinião é fundamental para o meu desempenho e para melhorarmos nossos serviços. Agradeço desde já!`;
    } else {
        txtMensagem.value = "";
    }
});

chkEncerramento.addEventListener("change", () => {
    if (chkEncerramento.checked) {
        chkAvaliacao.checked = false;
        txtMensagem.value =
`Olá [Nome do Cliente!]

Meu nome é [nome do Tecnico].

Tentamos contato porém, não tivemos respostas de vossa parte para darmos continuidade no atendimento em aberto, referente a MOTIVO.
Caso não tivermos resposta dentro de 24 horas, estaremos cancelando o chamado. Ficamos no aguardo do seu retorno.

Obrigado!`;
    } else {
        txtMensagem.value = "";
    }
});

/* ==========================
   ADICIONAR CONTATO
   ========================== */
btnAdd.addEventListener("click", () => {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();

    if (!nome || !telefone) return alert("Preencha nome e telefone!");

    contatos.push({ nome, telefone });
    atualizarLista();

    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
});

/* ==========================
   ATUALIZAR LISTA NA TELA
   ========================== */
function atualizarLista() {
    listaContatos.innerHTML = "";

    contatos.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><strong>${c.nome}</strong> — ${c.telefone}</span>
            <button class="del-btn" onclick="remover(${i})">X</button>
        `;
        listaContatos.appendChild(li);
    });
}

function remover(i) {
    contatos.splice(i, 1);
    atualizarLista();
}

/* ==========================
   ENVIAR PARA TODOS (1 ABA)
   ========================== */
btnEnviarTodos.addEventListener("click", async () => {
    if (contatos.length === 0) return alert("Nenhum contato na lista!");
    if (!txtMensagem.value.trim()) return alert("Mensagem vazia!");

    alert("O envio começará agora.\nIMPORTANTE: Não feche a aba do WhatsApp.");

    for (let c of contatos) {
        let msg = txtMensagem.value.replace("[Nome do Cliente!]", c.nome);

        const url = `https://web.whatsapp.com/send?phone=${c.telefone}&text=${encodeURIComponent(msg)}`;

        window.open(url, "_blank");

        await esperar(4500); // tempo para WhatsApp carregar
    }

    alert("Mensagens carregadas! Agora clique Manualmente em 'ENVIAR' em cada conversa.");
});

/* Delay */
function esperar(ms) {
    return new Promise(res => setTimeout(res, ms));
}
