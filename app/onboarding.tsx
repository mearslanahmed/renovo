import { View, Text } from 'react-native'
import { useEffect } from 'react'
import { usePostHog } from 'posthog-react-native'

const Onboarding = () => {
  const posthog = usePostHog()

  useEffect(() => {
    posthog.capture('onboarding_started')
  }, [posthog])

  return (
    <View>
      <Text>Onboarding</Text>
    </View>
  )
}

export default Onboarding