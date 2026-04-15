import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⭐ 北极星人生守护</Text>
      <Text style={styles.subtitle}>全程在线，守护您的每一天</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 12 },
});
