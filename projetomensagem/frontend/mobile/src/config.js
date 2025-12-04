import Constants from 'expo-constants';

const manifest = Constants.manifest || Constants.expoConfig || {};
const extra = (manifest.extra) || {};

export const SOCKET_SERVER_URL = extra.SOCKET_SERVER_URL || 'http://YOUR_SERVER_HOST:3000';
export const BACKEND_URL = extra.BACKEND_URL || 'http://YOUR_BACKEND_URL';

export default {
  SOCKET_SERVER_URL,
  BACKEND_URL,
};
