import { View, Text, TextInput, Button, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context'
import getMatchedUserInfo from '../lib/getMatchedUserInfo';
import useAuth from '../hooks/useAuth';
import { useRoute } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';
import SenderMessage from '../components/SenderMessage';
import RecieverMessage from '../components/RecieverMessage';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const MessageScreen = () => {
    const { user } = useAuth();
    //here matchDetails prop cannot be accessed through props. method therefore use useRoute
    const { params } = useRoute();
    const { matchDetails } = params;

    //render the messages on frontend
    useEffect(() => onSnapshot(query(collection(db, 'matches', matchDetails.id, 'messages'), orderBy('timestamp', 'desc')
    ),
     (snapshot) => setMessages(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })))),

     [matchDetails, db]);

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const sendMessage = () => { 
        addDoc(collection(db, 'matches', matchDetails.id, "messages"), {
            timestamp: serverTimestamp(),
            userId: user.uid,
            displayName: user.displayName,
            photoURL: matchDetails.users[user.uid].photoURL,
            message: input,
        })

        setInput("");
     };


    return (
        <SafeAreaView style={tw`flex-1`}>
            <Header title={getMatchedUserInfo(matchDetails?.users, user.uid).displayName} callEnabled />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`} keyboardVerticalOffset={10} >

                {/* hide the keyboard when you click on the chats  */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <FlatList 
                     data = {messages}
                     inverted={-1}
                     style = {tw`pl-4`}
                     keyExtractor={item => item.id}
                     renderItem={({ item: message}) => message.userId === user.uid ? (
                         <SenderMessage key = {message.id} message = {message} />
                     ) : (
                         <RecieverMessage key = {message.id} message = {message} />
                     )
                    }
                     />

                </TouchableWithoutFeedback>

                <View style={tw`flex-row justify-between items-center border-t border-gray-200 px-5 py-2`}>
                    <TextInput style={tw`h-10 text-lg`} placeholder='Send a message' onChangeText={setInput} onSubmitEditing={sendMessage}
                        value={input} />
                    <Button onPress={sendMessage} title='Send' color='#FF5864' />
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};

export default MessageScreen;
