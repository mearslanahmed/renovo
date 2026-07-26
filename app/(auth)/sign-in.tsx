import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const SignIn = () => {
  return (
    <View>
      <Text>SigIn</Text>
      <Link href="/(auth)/sign-in">Sign In</Link>
    </View>
  )
}

export default SignIn