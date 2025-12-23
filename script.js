// --- CONFIGURAÇÃO ---
// GARANTA QUE ESTA URL É A DA SUA ULTIMA IMPLANTAÇÃO (A que funcionou no teste do console)
const API_URL = "https://script.google.com/macros/s/AKfycbw6Gz6jHJDNn76jyGEq486ZdQ1noXgJ86nC1nlcJ-lZnDp5_RC-8wKTcHQTf8hqXCSu/exec";

let usuarioLogado = null;

// --- FUNÇÃO DE LOGIN ---
function fazerLogin() {
    console.log("1. Função fazerLogin iniciada"); // Debug

    const usuarioInput = document.getElementById('login-usuario');
    const senhaInput = document.getElementById('login-senha');
    const msgErro = document.getElementById('msg-login');

    // Verificação de segurança caso os IDs do HTML estejam errados
    if (!usuarioInput || !senhaInput) {
        console.error("ERRO CRÍTICO: Não achei os inputs no HTML. Verifique os IDs 'login-usuario' e 'login-senha'");
        alert("Erro no código HTML. Abra o console.");
        return;
    }

    const usuario = usuarioInput.value;
    const senha = senhaInput.value;

    console.log("2. Dados pegos do formulário:", usuario, senha);

    if(!usuario || !senha) {
        msgErro.innerText = "Preencha todos os campos!";
        return;
    }

    msgErro.innerText = "Verificando...";
    console.log("3. Enviando para a API...");

    const dados = {
        action: "login",
        usuario: usuario,
        senha: senha
    };

    enviarParaAPI(dados, (resposta) => {
        console.log("5. Resposta recebida dentro do fazerLogin:", resposta);
        
        if(resposta.status === "sucesso") {
            usuarioLogado = usuario;
            document.getElementById('display-usuario').innerText = usuarioLogado;
            document.getElementById('tela-login').classList.add('escondido');
            document.getElementById('tela-sistema').classList.remove('escondido');
            carregarAgendamentos();
        } else {
            // AQUI É ONDE ELE ESTAVA TRAVANDO ANTES
            msgErro.innerText = resposta.msg || "Erro desconhecido"; 
            console.log("Login recusado pelo servidor:", resposta.msg);
        }
    });
}

// --- FUNÇÃO DE ENVIAR (A Mágica) ---
function enviarParaAPI(dados, callbackSucesso) {
    fetch(API_URL, {
        method: "POST",
        // Importante: text/plain para evitar CORS Preflight
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(dados)
    })
    .then(response => {
        console.log("4a. Resposta bruta da rede recebida");
        return response.text(); // Pega como texto primeiro para garantir
    })
    .then(texto => {
        console.log("4b. Texto recebido do servidor:", texto);
        try {
            const json = JSON.parse(texto); // Tenta transformar em JSON
            callbackSucesso(json); // Chama a função de volta
        } catch (e) {
            console.error("ERRO AO LER JSON:", e);
            document.getElementById('msg-login').innerText = "Erro: Servidor não retornou JSON válido.";
            alert("O servidor respondeu, mas não foi JSON. Olhe o console.");
        }
    })
    .catch(error => {
        console.error("ERRO DE REDE:", error);
        document.getElementById('msg-login').innerText = "Erro de conexão.";
        alert("Falha na conexão com o Google.");
    });
}

// --- OUTRAS FUNÇÕES (Pode manter as suas ou colar estas versões simples) ---
function sair() { location.reload(); }

// ... (Mantenha o resto das suas funções agendar/listar aqui) ...
// Para testar o login, não precisamos delas agora.
