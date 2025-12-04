import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AgentsListScreen({ route, navigation }) {
  const { userName } = route.params;

  const agents = [
    { id: '1', name: 'Suporte 01' },
    { id: '2', name: 'Suporte 02' },
  ];

  function openChat(agent) {
    navigation.navigate('Chat', { agent, userName });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha um atendente</Text>

      {agents.map(a => (
        <TouchableOpacity
          key={a.id}
          style={styles.item}
          onPress={() => openChat(a)}
        >
          <Text style={styles.itemText}>{a.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 22,
    marginBottom: 20
  },
  item: {
    padding: 15,
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 10
  },
  itemText: {
    fontSize: 18
  }
});
