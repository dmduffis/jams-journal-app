import {View, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/client';
import client from './services/ApolloClientSetup';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as Font from 'expo-font'
import Home from './screens/Home';
import AuthorDetails from './screens/AuthorDetails';
import Article from './screens/Article';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import IssueDetails from './screens/IssueDetails';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {

  const [fontsLoaded] = useFonts({
    serif_light: require("./assets/fonts/IBMPlexSerif-Light.ttf"),
    serif_medium: require("./assets/fonts/IBMPlexSerif-Medium.ttf"),
    serif_regular: require("./assets/fonts/IBMPlexSerif-Regular.ttf"),
    serif_semibold: require("./assets/fonts/IBMPlexSerif-SemiBold.ttf"),
    serif_bold: require("./assets/fonts/IBMPlexSerif-Bold.ttf"),
    serif_italic: require("./assets/fonts/IBMPlexSerif-Italic.ttf"),
    serif_thin: require("./assets/fonts/IBMPlexSerif-Thin.ttf"),
    sans_light: require("./assets/fonts/IBMPlexSans-Light.ttf"),
    sans_medium: require("./assets/fonts/IBMPlexSans-Medium.ttf"),
    sans_regular: require("./assets/fonts/IBMPlexSans-Regular.ttf"),
    sans_semibold: require("./assets/fonts/IBMPlexSans-SemiBold.ttf"),
    sans_thin: require("./assets/fonts/IBMPlexSans-Thin.ttf"),
    sans_bold: require("./assets/fonts/IBMPlexSans-Bold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <NavigationContainer
      onReady={onLayoutRootView}>
      <Stack.Navigator>
      
      <Stack.Screen 
            name="Home"
            component={Home}
            options={{headerShown:false}}
            />

      <Stack.Screen 
            name="Author Details"
            component={AuthorDetails}
            options={{headerShown:false}}
            />

      <Stack.Screen 
            name="Article"
            component={Article}
            options={{headerShown:false}}
            />

      <Stack.Screen 
            name="Issue Details"
            component= {IssueDetails}
            options={{headerShown:false}}
            />

    </Stack.Navigator>
    </NavigationContainer>
    </ApolloProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
