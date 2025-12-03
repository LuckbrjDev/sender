// script.js (module)
const STORAGE_KEYS = {
  CONTACTS: 'wh_contacts_v1',
  SAVED_MESSAGE: 'wh_saved_message_v1',
  ME_NAME: 'wh_me_name_v1',
  ME_COMPANY: 'wh_me_company_v1'
};

/* ---------- SELECTORS ---------- */
const contactsListEl = document.getElementById('contacts-list');
const addBtn = document.getElementById('add-contact');
const contactNameEl = document.getElementById('contact-name');
const contactPhoneEl = document.getElementById('contact-phone');
const contactEmailEl = document.getElementById('contact-email');

const messageEl = document.getElementById('message');
const saveTemplateBtn = document.getElementById('save-template');
const clearTemplateBtn = document.getElementById('clear-template');

const tplAvaliacao = document.getElementById('tpl-avaliacao');
const tplEncerramento = document.getElementById('tpl-encerramento');
const tplContinuidade = document.getElementById('tpl-continuidade');

const meNameEl = document.getElementById('me-name');
const meCompanyEl = document.getElementById('me-company');

let contacts = [];

/* ---------- MESSAGES TEMPLATES ---------- */
const TEMPLATES = {
  avaliacao: `Olá, tudo bem? 😊

Aqui é o (nome do técnico) da Soften. Só passando para confirmar se ficou alguma dúvida ou pendência do nosso último atendimento — posso te ajudar em algo mais?

Aproveitando, percebi que a avaliação ainda está pendente. O formulário foi enviado para seu e-mail. Se puder dar uma olhadinha (inclusive no Spam), isso me ajuda muito!

Obrigado pela colaboração! `,

  encerramento: `Olá [Nome do Cliente!]

Meu nome é Fulano.

Tentamos contato porém, não tivemos respostas de vossa parte para darmos continuidade no atendimento em aberto, referente a MOTIVO.
Caso não tivermos resposta dentro de 24 horas, estaremos cancelando o chamado, ficamos no aguardo do seu retorno,
Obrigado!`,

  continuidade: `Olá! Meu nome é (digite seu nome), tudo bem?

Estou entrando em contato referente à empresa (digite razão social ou CNPJ).
Tentamos falar com você para dar continuidade ao atendimento em aberto, porém não obtivemos retorno.

Você poderia, por gentileza, confirmar se podemos prosseguir com o atendimento agora?

Fico à disposição!`
};

/* ---------- UTIL ---------- */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    contacts = raw ? JSON.parse(raw) : [];
  } catch {
    contacts = [];
  }

  // load saved message and profile fields
  const savedMsg = localStorage.getItem(STORAGE_KEYS.SAVED_MESSAGE);
  if (savedMsg) messageEl.value = savedMsg;

  const mn = localStorage.getItem(STORAGE_KEYS.ME_NAME);
  if (mn) meNameEl.value = mn;

  const mc = localStorage.getItem(STORAGE_KEYS.ME_COMPANY);
  if (mc) meCompanyEl.value = mc;
}

function formatPhone(raw) {
  // remove non-digits
  const digits = String(raw || '').replace(/\D/g, '');
  return digits;
}

function openWhatsAppInNewTab(phone, text) {
  // phone should be digits only with country code (e.g., 5511999998888)
  const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  // open in new tab
  window.open(url, '_blank');
}

function replacePlaceholders(template, contact) {
  let text = String(template || '');

  text = text.replace(/\[e-mail do cliente\]/gi, contact.email || '');
  text = text.replace(/\[Nome do Cliente!?]/gi, contact.name || '');
  // handle [Nome do Cliente] variants (robust)
  text = text.replace(/\[Nome do Cliente\]/gi, contact.name || '');
  text = text.replace(/\(digite seu nome\)/gi, meNameEl.value || '');
  text = text.replace(/\(digite razão social ou CNPJ\)/gi, meCompanyEl.value || '');
  // also replace placeholder token in "Olá [Nome do Cliente!]" with name
  text = text.replace(/\[Nome do Cliente!\]/gi, contact.name || '');
  return text;
}

/* ---------- RENDER ---------- */
function renderContacts() {
  contactsListEl.innerHTML = '';
  contacts.forEach((c, idx) => {
    const item = document.createElement('div');
    item.className = 'item';

    const info = document.createElement('div');
    info.className = 'info';
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = c.name || '(sem nome)';
    const meta = document.createElement('div'); meta.className = 'meta';
    meta.textContent = `${c.phone}${c.email ? ' • ' + c.email : ''}`;

    info.appendChild(nm);
    info.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const sendBtn = document.createElement('button');
    sendBtn.className = 'btn-send';
    sendBtn.textContent = 'Enviar';
    sendBtn.addEventListener('click', () => {
      handleSendSingle(idx);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-del';
    delBtn.textContent = 'Excluir';
    delBtn.addEventListener('click', () => {
      if (confirm(`Excluir contato "${c.name}"?`)) {
        contacts.splice(idx, 1);
        saveToStorage();
        renderContacts();
      }
    });

    actions.appendChild(sendBtn);
    actions.appendChild(delBtn);

    item.appendChild(info);
    item.appendChild(actions);

    contactsListEl.appendChild(item);
  });
}

/* ---------- ACTIONS ---------- */
function onlyOneCheckbox(checkedEl) {
  // uncheck all then check the provided one (toggle)
  const boxes = [tplAvaliacao, tplEncerramento, tplContinuidade];
  boxes.forEach(b => {
    if (b !== checkedEl) b.checked = false;
  });

  // load template into textarea if checked, else restore saved message
  if (checkedEl.checked) {
    if (checkedEl === tplAvaliacao) messageEl.value = TEMPLATES.avaliacao;
    else if (checkedEl === tplEncerramento) messageEl.value = TEMPLATES.encerramento;
    else if (checkedEl === tplContinuidade) messageEl.value = TEMPLATES.continuidade;
  } else {
    // restore saved message if any
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_MESSAGE);
    if (saved) messageEl.value = saved;
  }
}

tplAvaliacao.addEventListener('change', () => onlyOneCheckbox(tplAvaliacao));
tplEncerramento.addEventListener('change', () => onlyOneCheckbox(tplEncerramento));
tplContinuidade.addEventListener('change', () => onlyOneCheckbox(tplContinuidade));

saveTemplateBtn.addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEYS.SAVED_MESSAGE, messageEl.value);
  alert('Mensagem salva como padrão.');
});

clearTemplateBtn.addEventListener('click', () => {
  messageEl.value = '';
  localStorage.removeItem(STORAGE_KEYS.SAVED_MESSAGE);
  tplAvaliacao.checked = tplEncerramento.checked = tplContinuidade.checked = false;
});

meNameEl.addEventListener('change', () => {
  localStorage.setItem(STORAGE_KEYS.ME_NAME, meNameEl.value);
});
meCompanyEl.addEventListener('change', () => {
  localStorage.setItem(STORAGE_KEYS.ME_COMPANY, meCompanyEl.value);
});

/* add contact */
addBtn.addEventListener('click', () => {
  const name = contactNameEl.value.trim();
  const phoneRaw = contactPhoneEl.value.trim();
  const email = contactEmailEl.value.trim();

  if (!phoneRaw) {
    alert('Digite o telefone (com DDI). Ex: 5511999998888');
    return;
  }

  const phone = formatPhone(phoneRaw);
  if (!/^\d{8,15}$/.test(phone)) {
    alert('Telefone inválido. Digite com DDI e apenas números (ex: 5511999998888).');
    return;
  }

  const contact = { name, phone, email };
  contacts.push(contact);
  saveToStorage();
  renderContacts();

  // clear inputs
  contactNameEl.value = '';
  contactPhoneEl.value = '';
  contactEmailEl.value = '';
});

/* enviar apenas 1 contato (abre nova aba com whatsapp web) */
function handleSendSingle(index) {
  const contact = contacts[index];
  if (!contact) return;

  // decide which message to use: if any checkbox selected, use the textarea (already set)
  let text = messageEl.value.trim();
  if (!text) {
    alert('A mensagem está vazia. Escreva ou selecione uma opção.');
    return;
  }

  // substitute placeholders
  text = replacePlaceholders(text, contact);

  // format phone and open whatsapp
  const phone = formatPhone(contact.phone);
  openWhatsAppInNewTab(phone, text);
}

/* ---------- INIT ---------- */
function init() {
  loadFromStorage();
  renderContacts();

  // If saved message exists but user had checkbox previously used, keep saved loaded
  const saved = localStorage.getItem(STORAGE_KEYS.SAVED_MESSAGE);
  if (saved) messageEl.value = saved;
}

init();
