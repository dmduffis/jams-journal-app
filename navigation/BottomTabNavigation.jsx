import React, { useRef } from 'react';
import { Text, View, TouchableOpacity, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home'
import Search from '../screens/Search'
import Chat from '../screens/Chat'
import Videos from '../screens/Videos'
import Browse from '../screens/Browse';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function BounceTabButton(props) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.10, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 200,
      }),
    ]).start();
    props.onPress?.();
  };
  return (
    <TouchableOpacity {...props} onPress={handlePress} activeOpacity={1} style={[props.style, { alignItems: 'center', justifyContent: 'center' }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {props.children}
      </Animated.View>
    </TouchableOpacity>
  );
}

const screenOptions = {
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    headerShown: false,
    tabBarButton: (props) => <BounceTabButton {...props} />,
    sceneContainerStyle: { backgroundColor: '#fff' },
    tabBarStyle: {
        position: "absolute",
        bottom: 0,
        right: 0,
        left: 0,
        elevation: 0,
        height: 76,
    }

}

export default function BottomTabNavigation() {
    return (
      <Tab.Navigator screenOptions={screenOptions}>

    <Tab.Screen
        name="Home"
        component={Home}
        options = {{
            tabBarIcon: ({focused}) => {
                return <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? '#016180' : 'gray'} />
            }
            }}/>

        <Tab.Screen
        name="Search"
        component={Search}
        options = {{
            tabBarIcon: ({focused}) => {
                return <Ionicons 
                name={focused ? "search" : "search-outline"}
                size={24}
                color={focused? '#016180': 'gray'} />
            }
            }}/>

        <Tab.Screen
        name="Chat"
        component={Chat}
        options = {{
            tabBarIcon: ({focused}) => {
                return <Ionicons 
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={24}
                color={focused? '#016180': 'gray'} />
            }
            }}/>

        <Tab.Screen
        name="Browse"
        component={Browse}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={24}
              color={focused ? "#016180" : "gray"}
            />
          ),
        }}/>

        <Tab.Screen
                name="Videos"
                component={Videos}
                options = {{
                    tabBarIcon: ({focused}) => {
                        return <Ionicons
                        name={focused ? "videocam" : "videocam-outline"}
                        size={24}
                        color={focused? '#016180': 'gray'} />
                    }
                    }}/>
      </Tab.Navigator>
    )
  }

