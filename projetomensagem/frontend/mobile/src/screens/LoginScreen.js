import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');

  function handleLogin() {
    if (!name) return;
    navigation.replace('Agents', { userName: name });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <TextInput
        placeholder="Seu nome"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Button title="Continuar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ad0000ff', padding: 8, marginBottom: 12 },
});
