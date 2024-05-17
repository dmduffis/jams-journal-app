import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home'
import Search from '../screens/Search'
import UserProfile from '../screens/UserProfile'
import Videos from '../screens/Videos';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const screenOptions = {
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    headerShown: false,
    tabBarStyle: {
        position: "absolute",
        bottom: 0,
        right: 0,
        left: 0,
        elevation: 0,
        height: 70,
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
                name={"home"}
                size={24}
                color={focused? '#016180': 'gray'} />
            }
            }}/>

        <Tab.Screen
        name="Search"
        component={Search}
        options = {{
            tabBarIcon: ({focused}) => {
                return <Ionicons 
                name={"search-sharp"}
                size={24}
                color={focused? '#016180': 'gray'} />
            }
            }}/>

        <Tab.Screen
                name="Videos"
                component={Videos}
                options = {{
                    tabBarIcon: ({focused}) => {
                        return <MaterialIcons
                        name={"ondemand-video"} 
                        size={24}
                        color={focused? '#016180': 'gray'} />
                    }
                    }}/>
        
        <Tab.Screen
                name="Profile"
                component={UserProfile}
                options = {{
                    tabBarIcon: ({focused}) => {
                        return <Ionicons 
                        name={focused? "person" : "person-outline"} 
                        size={24}
                        color={focused? '#016180': 'gray'} />
                    }
                    }}/>
            
      </Tab.Navigator>
    )
  }

