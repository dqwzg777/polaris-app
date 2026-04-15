import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, PermissionsAndroid, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import * as KeepAwake from 'expo-keep-awake';

// 屏幕
import HomeScreen from './screens/HomeScreen';
import HealthScreen from './screens/HealthScreen';
import MemoryScreen from './screens/MemoryScreen';
import ChatScreen from './screens/ChatScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import WillScreen from './screens/WillScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// 全局语音状态
let globalOnWakeUp = null;
export function registerWakeUp(fn) { globalOnWakeUp = fn; }
export function triggerWakeUp(text) { if (globalOnWakeUp) globalOnWakeUp(text); }

// 语音播报
export async function speak(text, onEnd) {
  try {
    await Speech.speak(text, {
      language: 'zh-CN', pitch: 1.0, rate: 0.85,
      onDone: () => { if (onEnd) onEnd(); },
      onError: () => { if (onEnd) onEnd(); }
    });
  } catch (e) { console.error('Speech error:', e); if (onEnd) onEnd(); }
}
export async function stopSpeaking() {
  try { await Speech.stop(); } catch(e) {}
}
export async function isSpeakingNow() {
  return await Speech.isSpeakingAsync();
}

// 录音
let recording = null;
export async function startListening(onResult) {
  try {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) { Alert.alert('权限不足', '请允许麦克风权限'); return; }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recording = rec;
    recording._onResult = onResult;
    console.log('Recording started');
  } catch (e) { console.error('Failed to start recording', e); Alert.alert('录音失败', String(e)); }
}
export async function stopListening() {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording = null;
      if (uri && recording?._onResult) {} // handled below
      return uri;
    }
  } catch (e) { console.error('Stop recording error', e); }
  return null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，早点休息';
  if (h < 9) return '早上好，今天有什么计划吗';
  if (h < 12) return '上午好，今天精神不错';
  if (h < 14) return '中午好，记得吃午饭';
  if (h < 18) return '下午好，喝点水休息一下';
  if (h < 21) return '傍晚好，晚餐准备好了吗';
  return '晚上好，今天辛苦了，早点休息';
}

async function requestPermissions() {
  if (Platform.OS === 'android') {
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    } catch (e) { console.error('Permission error', e); }
  }
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen}
          options={{ title: '北极星人生守护', headerShown: false }} />
        <Stack.Screen name="Health" component={HealthScreen} options={{ title: '健康档案' }} />
        <Stack.Screen name="Memory" component={MemoryScreen} options={{ title: '生活记忆' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'AI 陪伴' }} />
        <Stack.Screen name="Emergency" component={EmergencyScreen}
          options={{ title: '紧急求助', headerStyle: { backgroundColor: '#ff416c' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="Will" component={WillScreen} options={{ title: '遗愿清单' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
