import { View, Text } from 'react-native';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as Google from 'expo-google-app-auth';

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "@firebase/auth";
import { auth } from '../firebase';

const AuthContext = createContext({})

const config = {
  androidClientId: '939088529116-6fkmv3thp8v3knkj3fj3llj3jk825r4h.apps.googleusercontent.com',
  // 939088529116-6fkmv3thp8v3knkj3fj3llj3jk825r4h.apps.googleusercontent.com this is for android client ID after registering SHA1
  // 939088529116-00et35gb6hherlffplork7scjrf79n0j.apps.googleusercontent.com this is web client ID
  iosClientId: '939088529116-hd1n8l9egi1m05h2mu8au6qclrdtau6d.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  permissions: ['public_profile', 'email', 'gender', 'location'],
}

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  //to get rid of the lag between login screen and actual app use this below
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() =>
    onAuthStateChanged(auth, (user) => {
      if (user) {
        //means logged in...then
        setUser(user);
      }
      else {
        setUser(null);
      }

      //now the user has been fetched therefore,
      setLoadingInitial(false);
    })
    , []);


//Logout Function. Pass it through the app and make a button to use this function.
    const logout = () => {
      setLoading(true);

      signOut(auth).catch((error) => setError(error))
      .finally(() => setLoading(false));
    }

    //Sign in function. Pass it through the app and make a button to use this function.
  const signInWithGoogle = async () => {

    setLoading(true);

    await Google.logInAsync(config).then(async (logInResult) => {
      if (logInResult.type === 'success') {
        //login....
        const { idToken, accessToken } = logInResult;
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        await signInWithCredential(auth, credential);
      }

      //if it's unsuccessfull then promise reject.
      return Promise.reject();
    }).catch(error => setError(error))
    .finally(() => setLoading(false));
  }

  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      signInWithGoogle,
      logout,
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={memoedValue}
    >
      {/* only load the children when you are not loading. to remove the delay. */}
      { !loadingInitial && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext)
}

