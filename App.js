import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import CameraScreen from './Components/CameraScreen';
import GallaryScreen from './Components/GallaryScreen';

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Gallary" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={GallaryScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    // <View style={styles.container}>
    //   {/* <Text>Open up App.js to start working on your app!</Text> */}
    //   <CameraScreen />
    //   {/* <GallaryScreen /> */}
    //   <StatusBar style="auto" />
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
