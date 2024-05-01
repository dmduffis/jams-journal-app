import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AuthorDetails from "../screens/AuthorDetails";
import Home from "../screens/Home";


const Stack = createNativeStackNavigator();

export default StackNavigation = () => {

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

        </Stack.Navigator>
    }