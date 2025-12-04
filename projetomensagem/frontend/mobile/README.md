# Chat Delivery (Mobile)

Projeto Expo com telas básicas (login, lista de atendentes, chat), Socket.IO e armazenamento local simples.

Como usar

- Instalar dependências:

```powershell
cd mobile
npm install
```

- Rodar em desenvolvimento:

```powershell
npx expo start
```

Configurar o Socket.IO server

Edite `process.env.SOCKET_SERVER_URL` ou altere `src/services/socket.js` para apontar ao seu servidor Socket.IO (ex: `http://10.0.2.2:3000` para emulador Android, ou `http://localhost:3000` para web).

Armazenamento local

Mensagens são salvas por chat usando `AsyncStorage` (arquivo `src/utils/storage.js`). Serve para offline simples.

Notificações push (FCM / Expo)

- Este projeto usa `expo-notifications`. Para enviar push a partir do backend use a API do Expo Push ou integre FCM:
  - Para Android com FCM quando utilizar build nativo (EAS), coloque `google-services.json` na raiz `mobile/` e siga a documentação do Expo para configurar `app.json`.
  - O registro do token obtido pelo Expo (`getExpoPushTokenAsync`) é feito em `src/push/register.js` e enviado para `BACKEND_URL + '/api/push/register'`.

Observações

- Em device físico as notificações funcionarão melhor.
- Para usar Firebase Cloud Messaging direto com `firebase/messaging` é necessário um build nativo e configurações adicionais; recomendo usar o fluxo do Expo/FCM — ver: https://docs.expo.dev/push-notifications/using-fcm/
