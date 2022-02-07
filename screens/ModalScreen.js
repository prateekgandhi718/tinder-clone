import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import tw from 'tailwind-react-native-classnames'
import useAuth from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/core';
import { doc, setDoc, serverTimestamp } from "@firebase/firestore";
import { db } from "../firebase";

const ModalScreen = () => {

    const { user } = useAuth();

    const [image, setImage] = useState(null);
    const [job, setJob] = useState(null);
    const [age, setAge] = useState(null);

    const navigation = useNavigation();

    const incompleteForm = !image || !job || !age;

    //Now let's interact with the backend now.
    const updateUserProfile = () => {
      setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName: user.displayName,
        photoURL: image,
        job: job,
        age: age,
        timestamp: serverTimestamp(),
      }).then( () => {
        navigation.navigate('Home')
      }).catch( (error) => {
        alert(error.message);
      });
    }

  return (
    <View style = {tw`flex-1 justify-center items-center pt-1`} >
        <Image style = {tw`h-20 w-full`} resizeMode='contain' source = {{uri: "https://links.papareact.com/2pf"}} />
      <Text style = {tw`text-xl text-gray-500 p-2 font-bold`} >Welcome, {user.displayName}!</Text>

      <Text style = {tw`text-center p-4 font-bold text-red-400`}>
          Step 1: The profile picture
      </Text>
      <TextInput value={image} onChangeText={(lekhan) => {setImage(lekhan)}} style = {tw`text-center text-xl pb-2`} placeholder='Enter the profile picture URL' />

      <Text style = {tw`text-center p-4 font-bold text-red-400`}>
          Step 2: Occupation
      </Text>
      <TextInput value={job} onChangeText={lekhan => setJob(lekhan)} style = {tw`text-center text-xl pb-2`} placeholder='Enter your job' />

      <Text style = {tw`text-center p-4 font-bold text-red-400`}>
          Step 3: Your age
      </Text>
      <TextInput value={age} onChangeText={(lekhan) => {setAge(lekhan)}} style = {tw`text-center text-xl pb-2`} maxLength={2} keyboardType='numeric' placeholder='Enter you age' />

      <TouchableOpacity
      disabled={incompleteForm}
      style = {[tw`w-64 p-3 rounded-xl absolute bottom-10`, incompleteForm ? tw`bg-gray-400` : tw`bg-red-400`]}
      onPress={updateUserProfile} >
          <Text style = {tw`text-center text-white text-xl`} >Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModalScreen;
