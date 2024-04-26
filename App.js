import {View, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/client';
import client from './services/ApolloClientSetup';
import { useFonts } from 'expo-font';
import Home from './screens/Home';
import AppLoading from 'expo-app-loading';

export default function App() {

  const [fontsLoaded] = useFonts({
    serif_light: require("./assets/fonts/IBMPlexSerif-Light.ttf"),
    serif_medium: require("./assets/fonts/IBMPlexSerif-Medium.ttf"),
    serif_regular: require("./assets/fonts/IBMPlexSerif-Regular.ttf"),
    serif_semibold: require("./assets/fonts/IBMPlexSerif-SemiBold.ttf"),
    serif_bold: require("./assets/fonts/IBMPlexSerif-Bold.ttf"),
    serif_thin: require("./assets/fonts/IBMPlexSerif-Thin.ttf"),
    sans_light: require("./assets/fonts/IBMPlexSans-Light.ttf"),
    sans_medium: require("./assets/fonts/IBMPlexSans-Medium.ttf"),
    sans_regular: require("./assets/fonts/IBMPlexSans-Regular.ttf"),
    sans_semibold: require("./assets/fonts/IBMPlexSans-SemiBold.ttf"),
    sans_thin: require("./assets/fonts/IBMPlexSans-Thin.ttf"),
    sans_bold: require("./assets/fonts/IBMPlexSans-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }


  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
      <Home />
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
