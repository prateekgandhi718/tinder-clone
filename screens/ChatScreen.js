import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react';
import Header from '../components/Header';
import ChatList from '../components/ChatList';

const ChatScreen = () => {
  return (
    <SafeAreaView>
      <Header title = "Chats." />

      <ChatList />
    </SafeAreaView>

  );
};

export default ChatScreen;
