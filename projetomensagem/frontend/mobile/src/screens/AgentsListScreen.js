import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const DUMMY_AGENTS = [
  { id: '1', name: 'Login' },
];

export default function AgentsListScreen({ navigation, route }) {
  const { userName } = route.params || {};

  function openChat(agent) {
    navigation.navigate('Chat', { agent, userName });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Atendentes disponíveis</Text>
      <FlatList
        data={DUMMY_AGENTS}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => openChat(item)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, marginBottom: 8 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
