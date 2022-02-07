import { View, Text, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import useAuth from '../hooks/useAuth';
import tw from 'tailwind-react-native-classnames';
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import { onSnapshot, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { doc, collection, setDoc, getDoc } from "@firebase/firestore";
import { db } from "../firebase";
import generateId from '../lib/generateid';

const DUMMY_DATA = [
  {
    firstName: "Prateek",
    lastName: "Gandhi",
    job: "cloud dev",
    photoURL: "https://www.jquery-az.com/html/images/banana.jpg",
    age: 27,
    id: 123,
  },
  {
    firstName: "Ritika",
    lastName: "Singh",
    job: "stripper",
    photoURL: "https://www.jquery-az.com/html/images/banana.jpg",
    age: 28,
    id: 234,
  },
  {
    firstName: "kritika",
    lastname: "rajvanshi",
    job: "student",
    photoURL: "https://www.jquery-az.com/html/images/banana.jpg",
    age: 22,
    id: 455,
  },
];


const HomeScreen = () => {

  // import the navigation hook 
  const navigation = useNavigation();

  //pulling out the logout function from out useAuth hook
  const { user, logout } = useAuth();

  //Profiles that would be fetched from the database.
  const [profiles, setProfiles] = useState([]);

  //useRef to automatically swipe right when you press the like button
  const swipeRef = useRef(null);

  //Force open the modal if you we don't find you in the userbase.
  useLayoutEffect(() => onSnapshot(doc(db, 'users', user.uid), (snapshot) => {

    if (!snapshot.exists()) {
      navigation.navigate('Modal');
    }
  }), []);


  useEffect(() => {
    let unsub;


    const fetchCards = async () => {
      //exclusion logic. collect all the ids in the passes collection in a variable
      const passes = await getDocs(collection(db, 'users', user.uid, "passes"))
        .then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const swipes = await getDocs(collection(db, 'users', user.uid, "swipes"))
        .then((snapshot) => snapshot.docs.map((doc) => doc.id));

      //make another variable to query. //test is written because you cannot query empty handed you have to have something. We use await therefore we won't go forward with our test if length is indeed greater than 0.
      const passedUserIds = passes.length > 0 ? passes : ['test'];
      const swipedUserIds = passes.length > 0 ? swipes : ['test'];

      unsub = onSnapshot(query(collection(db, 'users'), where('id', 'not-in', [...passedUserIds, ...swipedUserIds])), snapshot => {
        setProfiles(snapshot.docs.filter((doc) => doc.id !== user.uid).map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        );
      });
    };

    fetchCards();
    return unsub;
  }, [db]);
  // console.log(user);
  // console.log(profiles);
  //hide the topbar
  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerShown: false,
  //   });
  // }, []);

  //making the hiding of the top bar as default in stacknavigator. screen options.

  //Implementing swipe left and right!
  const swipeLeft = (cardIndex) => {
    if (!profiles[cardIndex]) return; //do nothing if there is no cardindex that is swiping on no body. 

    const userSwiped = profiles[cardIndex];
    console.log(`You swiped LEFT/PASS on ${userSwiped.displayName}`);

    //update the passed user in the passes collection of the user which is swiping.
    setDoc(doc(db, 'users', user.uid, "passes", userSwiped.id), userSwiped);
  };

  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    //Implementing the match on swipe right functionality.
    const loggedInProfile = await (
      await getDoc(doc(db, 'users', user.uid))
    ).data();

    //check if the user that you are swiping right on, has previously swiped right you or not. if yes, then match otherwise you swipe right on them and they had left swiped you or they haven't seen you yet.
    getDoc(doc(db, 'users', userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          //they have already right swiped you before therefore create a match. first record the swipe tho in the swipes.
          setDoc(doc(db,'users', user.uid, "swipes", userSwiped.id), userSwiped);
          console.log("It's a match.");

          //CREATE A MATCHHHHHHH! making another collection of matches. just like we had users. just combine the IDs of both to get a new one.
          setDoc(doc(db, 'matches', generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid] : loggedInProfile,
              [userSwiped.id] : userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });

          //navigate to Match which is the name of the MatchScreen.js. Now we are passing loggedInProfile and userSwiped as props here.
          navigation.navigate('Match', {
            loggedInProfile,
            userSwiped,
          });
        }
        else {
          console.log(`You swiped right on ${userSwiped.displayName}`);
          setDoc(doc(db,'users', user.uid, "swipes", userSwiped.id), userSwiped);
        }
      }
    )
  }

  return (
    <SafeAreaView style={tw`flex-1`}>
      {/* Header starts */}

      <View style={tw`flex-row items-center justify-between px-5`}>
        <TouchableOpacity style={tw``} onPress={logout} >
          <Image style={tw`h-10 w-10 rounded-full`} source={{ uri: user.photoURL }} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Modal')} >
          <Image style={tw`h-16 w-14`} source={require("../tinder-logo.png")} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Chats')}>
          <Ionicons name="chatbubbles-sharp" size={30} color='#FF5864' />
        </TouchableOpacity>


      </View>
      {/* Header ends */}

      {/* The Cards */}
      <View style={tw`flex-1 -mt-6`}>
        <Swiper
          ref={swipeRef}
          containerStyle={{ backgroundColor: "transparent" }}
          cards={profiles}
          stackSize={5}
          cardIndex={0}
          animateCardOpacity
          verticalSwipe={false}
          backgroundColor={'#4FD0E9'}
          onSwipedLeft={(cardIndex) => {
            console.log("swiped PASS");
            swipeLeft(cardIndex);
          }}
          onSwipedRight={(cardIndex) => {
            console.log("swiped MATCH");
            swipeRight(cardIndex);
          }}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  textAlign: "right",
                  color: "red",
                },
              },
            },
            right: {
              title: "YES",
              style: {
                label: {
                  textAlign: "left",
                  color: "green",
                },
              },
            },
          }}
          renderCard={(card) => {
            return card ? <View key={card.id} style={tw`relative bg-white h-3/4 rounded-xl`}>
              <Image style={tw`absolute top-0 h-full w-full rounded-xl`} source={{ uri: card.photoURL }} />

              <View style={[tw`absolute bottom-0 bg-white w-full flex-row justify-between items-center h-20 px-6 py-2 rounded-b-xl`, styles.cardShadow,]} >
                <View>
                  <Text style={tw`text-xl font-bold`} >{card.displayName}</Text>
                  <Text>{card.job}</Text>
                </View>
                <Text style={tw`text-2xl font-bold`} > {card.age} </Text>
              </View>
            </View>

              :
              <View style={[tw`relative bg-white h-3/4 rounded-xl justify-center items-center`, styles.cardShadow,]}>
                <Text style={tw`font-bold pb-5`}>No more profiles to show.</Text>
                <Image style={tw`h-20 w-20`} height={100} width={100} source={{ uri: "https://links.papareact.com/6gb" }} />
              </View>
          }}
        />
      </View>

      <View style={tw`flex flex-row justify-evenly`} >
        <TouchableOpacity style={tw`bottom-4 items-center justify-center rounded-full w-16 h-16 bg-red-200`}
          onPress={() => swipeRef.current.swipeLeft()}>
          <Entypo name="cross" size={24} color={"red"} />
        </TouchableOpacity>

        <TouchableOpacity style={tw`bottom-4 items-center justify-center rounded-full w-16 h-16 bg-green-200`}
          onPress={() => swipeRef.current.swipeRight()}>
          <AntDesign name="heart" size={24} color={"green"} />
        </TouchableOpacity>

      </View>



    </SafeAreaView>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0, height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});