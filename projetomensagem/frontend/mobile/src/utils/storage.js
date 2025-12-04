import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'chat_messages_';

export async function saveMessagesForChat(chatId, messages) {
  try {
    await AsyncStorage.setItem(KEY_PREFIX + chatId, JSON.stringify(messages || []));
  } catch (e) {
    console.log('save messages error', e);
  }
}

export async function loadMessagesForChat(chatId) {
  try {
    const s = await AsyncStorage.getItem(KEY_PREFIX + chatId);
    if (!s) return [];
    return JSON.parse(s);
  } catch (e) {
    console.log('load messages error', e);
    return [];
  }
}
