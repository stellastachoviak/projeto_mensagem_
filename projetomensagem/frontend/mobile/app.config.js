const dotenv = require('dotenv');
const fs = require('fs');

// Tenta carregar .env se existir
try {
  if (fs.existsSync(__dirname + '/.env')) {
    dotenv.config({ path: __dirname + '/.env' });
  }
} catch (e) {
  // ignore
}

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || 'http://YOUR_SERVER_HOST:3000',
      BACKEND_URL: process.env.BACKEND_URL || 'http://YOUR_BACKEND_URL'
    }
  };
};
