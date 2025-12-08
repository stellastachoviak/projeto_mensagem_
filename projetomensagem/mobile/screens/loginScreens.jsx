import { useState } from "react";
import { View, TextInput, Button } from "react-native";
import axios from "axios";
import { API_URL } from "../api/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const login = async () => {
    const res = await axios.post(`${API_URL}/users/login`, { email });
    navigation.navigate("ChatList");
  };

  return (
    <View>
      <TextInput placeholder="email" onChangeText={setEmail} />
      <Button title="Entrar" onPress={login} />
    </View>
  );
}
