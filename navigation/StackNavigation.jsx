import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AuthorDetails from "../screens/AuthorDetails";
import Home from "../screens/Home";
import IssueDetails from "../screens/IssueDetails";


const Stack = createNativeStackNavigator();

export default StackNavigation = () => {

        <Stack.Navigator>

        <Stack.Screen 
            name="Home"
            component={ Home }
            options={{headerShown:false}}
            />

            <Stack.Screen 
            name="Author Details"
            component={ AuthorDetails }
            options={{headerShown:false}}
            />

            <Stack.Screen 
            name="Issue Details"
            component= { IssueDetails }
            options={{headerShown:false}}
            />

        </Stack.Navigator>
    }