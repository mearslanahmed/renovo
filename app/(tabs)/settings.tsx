import { Text, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth } from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-bold text-primary mb-5">Settings</Text>
      
      <Pressable 
        onPress={() => signOut()}
        className="mt-auto mb-28 items-center rounded-2xl bg-destructive py-4"
      >
        <Text className="text-base font-sans-bold text-white">Log out</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default Settings