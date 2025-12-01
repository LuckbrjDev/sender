// Carrega mensagem salva ao abrir
document.addEventListener("DOMContentLoaded", () => {
    const msgSalva = localStorage.getItem("mensagem_wpp");
    if (msgSalva) {
        document.getElementById("mensagem").value = msgSalva;
    }
});

// Salvar mensagem
document.getElementById("salvar").addEventListener("click", () => {
    const mensagem = document.getElementById("mensagem").value.trim();

    if (!mensagem) {
        alert("Digite uma mensagem antes de salvar.");
        return;
    }

    localStorage.setItem("mensagem_wpp", mensagem);
    alert("Mensagem salva com sucesso!");
});

// Enviar WhatsApp
document.getElementById("enviar").addEventListener("click", () => {
    const numero = document.getElementById("numero").value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();

    if (!numero || isNaN(numero)) {
        alert("Digite um número válido (somente números).");
        return;
    }

    if (!mensagem) {
        alert("Digite a mensagem antes de enviar.");
        return;
    }

    // Formatar número: adicionar 55 se necessário
    let numeroFormatado = numero;
    if (numero.length <= 11) numeroFormatado = "55" + numero;

    const link = `https://wa.me/${numeroFormatado}?text=${encodeURIComponent(mensagem)}`;

    window.open(link, "_blank");
});
