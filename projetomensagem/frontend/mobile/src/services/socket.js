const WebSocket = require("ws");

// Servidor WS na porta 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log(" Servidor WebSocket rodando na porta 8080...");

let users = {}; // { username: socket }

wss.on("connection", (socket) => {
    console.log("Novo cliente conectado.");

    socket.on("message", (data) => {
        const msg = data.toString();

        // ---------------------------
        // LOGIN DO USUÁRIO]
        // ---------------------------
        if (msg.startsWith("@+")) {
            const username = msg.replace("@+", "");
            users[username] = socket;
            console.log("Usuário conectado:", username);
            return;
        }

        // ---------------------------
        // LOGOUT DO USUÁRIO
        // ---------------------------
        if (msg.startsWith("@-")) {
            const username = msg.replace("@-", "");
            delete users[username];
            console.log("Usuário saiu:", username);
            return;
        }

        // ---------------------------
        // MENSAGEM NORMAL
        // ---------------------------
        if (msg.startsWith("!")) {
            const json = msg.substring(1);
            let obj;

            try {
                obj = JSON.parse(json);
            } catch (e) {
                console.log("Erro ao interpretar JSON:", e);
                return;
            }

            const { to, from, msg: message } = obj;

            console.log(`Mensagem de ${from} para ${to}: ${message}`);

            // Destinatário existe?
            if (users[to]) {
                users[to].send(`${from}: ${message}`);
            } else {
                console.log("Usuário não encontrado:", to);
            }

            return;
        }
    });

    socket.on("close", () => {
        for (let u in users) {
            if (users[u] === socket) {
                delete users[u];
                console.log(" Usuário desconectou:", u);
                break;
            }
        }
    });
});
