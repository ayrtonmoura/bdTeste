// --- CONFIGURAÇÃO ---
const API_URL = "https://script.google.com/macros/s/AKfycby77Lg9FSIO3SJz5OA5Z84nMw1ZlIFOOn4rT_Ze0WX24ABRgdhS0-mgXcEm6Kc4HMqR/exec";

// --- VARIÁVEIS DE CONTROLE ---
let usuarioLogado = null; // Guardará o nome de quem entrou

// --- FUNÇÃO DE LOGIN ---
function fazerLogin() {
    const usuarioInput = document.getElementById('login-usuario').value;
    const senhaInput = document.getElementById('login-senha').value;
    const msgErro = document.getElementById('msg-login');

    if(!usuarioInput || !senhaInput) {
        msgErro.innerText = "Preencha todos os campos !";
        return;
    }

    msgErro.innerText = "Verificando...";

    // Prepara o pacote para enviar
    const dados = {
        action: "login",
        usuario: usuarioInput,
        senha: senhaInput
    };

    function enviarParaAPI(dados, callbackSucesso) {
    // 1. Envia os dados como string pura (text/plain)
    // Isso evita que o navegador faça uma verificação de segurança (OPTIONS) que o Google rejeita
    fetch(API_URL, {
        method: "POST",
        // Importante: Não defina headers de Content-Type application/json
        // Deixe o navegador enviar como text/plain por padrão ou force assim:
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na resposta da rede: ' + response.statusText);
        }
        return response.json();
    })
    .then(json => {
        callbackSucesso(json);
    })
    .catch(error => {
        console.error("Erro detalhado:", error);
        // Mostra o erro na tela para você saber o que houve
        alert("Erro de comunicação: " + error.message);
    });
}
}

// --- FUNÇÃO DE LOGOUT ---
function sair() {
    location.reload(); // Recarrega a página para limpar tudo
}

// --- FUNÇÃO DE SALVAR (CRIAR OU EDITAR) ---
function salvarAgendamento() {
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const unidade = document.getElementById('unidade').value;
    const idEdicao = document.getElementById('id-edicao').value;

    if(!data || !hora || !unidade) {
        alert("Preencha todos os campos");
        return;
    }

    const botao = document.getElementById('btn-salvar');
    botao.innerText = "Salvando...";
    botao.disabled = true;

    // Define se é criação nova ou edição baseada se tem ID escondido
    let dados;
    if (idEdicao) {
        // MODO EDIÇÃO
        dados = {
            action: "editar",
            idParaEditar: idEdicao,
            novaData: data,
            novaHora: hora,
            novaUnidade: unidade
        };
    } else {
        // MODO CRIAÇÃO (NOVO)
        dados = {
            action: "agendar",
            usuario: usuarioLogado,
            data: data,
            hora: hora,
            unidade: unidade
        };
    }

    enviarParaAPI(dados, (resposta) => {
        alert("Salvo com sucesso!");
        // Limpa o formulário
        document.getElementById('data').value = "";
        document.getElementById('hora').value = "";
        document.getElementById('unidade').value = "";
        document.getElementById('id-edicao').value = "";
        
        // Reseta botões
        botao.innerText = "Agendar";
        botao.disabled = false;
        document.getElementById('btn-cancelar').classList.add('escondido');
        
        // Atualiza a tabela
        carregarAgendamentos();
    });
}

// --- FUNÇÃO DE LISTAR ---
function carregarAgendamentos() {
    const loading = document.getElementById('loading');
    const tbody = document.getElementById('lista-corpo');
    
    loading.classList.remove('escondido');
    tbody.innerHTML = ""; // Limpa a tabela atual

    const dados = {
        action: "listar",
        usuario: usuarioLogado
    };

    enviarParaAPI(dados, (resposta) => {
        loading.classList.add('escondido');
        
        // Loop para criar as linhas da tabela
        resposta.dados.forEach(item => {
            // Formata a data simples (ano-mes-dia)
            let dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');
            // Corrige fuso horário simples cortando a string se vier completa
            // (Para simplicidade, usaremos o valor cru se for string YYYY-MM-DD)
            if(item.data.length >= 10) dataFormatada = item.data.substring(0,10).split('-').reverse().join('/');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${item.hora}</td>
                <td>${item.unidade}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicao('${item.id}', '${item.data}', '${item.hora}', '${item.unidade}')">Editar</button>
                    <button class="btn-excluir" onclick="apagarAgendamento('${item.id}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// --- FUNÇÃO DE APAGAR ---
function apagarAgendamento(id) {
    if(!confirm("Tem certeza que deseja apagar?")) return;

    const dados = {
        action: "apagar",
        idParaApagar: id
    };

    enviarParaAPI(dados, (resposta) => {
        if(resposta.status === "sucesso") {
            carregarAgendamentos();
        } else {
            alert("Erro ao apagar.");
        }
    });
}

// --- FUNÇÃO AUXILIAR: PREPARAR TELA PARA EDIÇÃO ---
function prepararEdicao(id, data, hora, unidade) {
    // Pega a data crua da API (que geralmente vem como string ISO 2024-12-25...)
    // O input type="date" precisa de YYYY-MM-DD.
    let dataInput = data;
    if(data.includes('T')) dataInput = data.split('T')[0]; 

    document.getElementById('id-edicao').value = id;
    document.getElementById('data').value = dataInput;
    
    // Formata hora se necessário
    let horaInput = hora;
    if(hora.length > 5) horaInput = hora.substring(0,5);
    document.getElementById('hora').value = horaInput;
    
    document.getElementById('unidade').value = unidade;

    // Muda o texto do botão e mostra cancelar
    document.getElementById('btn-salvar').innerText = "Atualizar Agendamento";
    document.getElementById('btn-cancelar').classList.remove('escondido');
}

function cancelarEdicao() {
    document.getElementById('id-edicao').value = "";
    document.getElementById('data').value = "";
    document.getElementById('hora').value = "";
    document.getElementById('unidade').value = "";
    document.getElementById('btn-salvar').innerText = "Agendar";
    document.getElementById('btn-cancelar').classList.add('escondido');
}

// --- FUNÇÃO CENTRAL DE COMUNICAÇÃO COM API (O FETCH) ---
function enviarParaAPI(dados, callbackSucesso) {
    // O Apps Script exige "text/plain" para evitar erros complexos de CORS em navegadores
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(json => {
        callbackSucesso(json);
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Houve um erro na comunicação com a planilha.");
    });
}
