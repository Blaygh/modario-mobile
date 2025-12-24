import { Link } from 'expo-router';
import {  Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {
  return (
    <SafeAreaView>
      <Link href="/(auth)" className=''>
        <Text className='text-black'>Go to Auth Screen</Text>
      </Link>
    </SafeAreaView>
  );
}