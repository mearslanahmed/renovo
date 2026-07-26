import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const SignUp = () => {
  return (
    <View>
      <Text>SigUp</Text>
      <Link href="/(auth)/sign-up">Create an Account</Link>
    </View>
  )
}

export default SignUp