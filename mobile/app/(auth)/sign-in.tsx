import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { usePostHog } from 'posthog-react-native';
import {
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { clsx } from 'clsx';
import { Ionicons } from '@expo/vector-icons';

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const passwordRef = useRef<TextInput>(null);

  const onSignInPress = async () => {
    if (!signIn) return;
    setLoading(true);
    setErrorMsg('');
    Keyboard.dismiss();

    try {
      // Use the new Core 3 password() method
      const result = await signIn.password({
        identifier: emailAddress,
        password,
      });

      if (result.error) {
        setErrorMsg(result.error.message || 'Invalid sign in attempt.');
        posthog.capture('sign_in_failed', {
          error_message: result.error.message || 'Invalid sign in attempt.',
        });
        return;
      }

      if (signIn.status === 'complete') {
        // Use finalize() instead of setActive() to activate the session
        const finalizeResult = await signIn.finalize();

        if (finalizeResult.error) {
          setErrorMsg(finalizeResult.error.message || 'Failed to activate session.');
          return;
        }

        posthog.identify(emailAddress, {
          email: emailAddress,
        });
        posthog.capture('user_signed_in');
        // The AuthLayout will automatically redirect to /(tabs) when isSignedIn becomes true
      } else {
        setErrorMsg(`Sign in incomplete (Status: ${signIn.status})`);
        posthog.capture('sign_in_failed', { error_message: `Incomplete status: ${signIn.status}` });
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.message || err.message || 'An error occurred.';
      setErrorMsg(message);
      posthog.capture('sign_in_failed', { error_message: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView className="auth-scroll" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="auth-content justify-center">
              
              <View className="auth-brand-block mt-4 mb-6">
                <View className="auth-logo-wrap mb-10">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">R</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">Renovo</Text>
                    <Text className="auth-wordmark-sub">SMART BILLING</Text>
                  </View>
                </View>
                
                <Text className="auth-title">Welcome back</Text>
                <Text className="auth-subtitle">Sign in to continue managing your subscriptions</Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <View className={clsx("auth-input-wrap", errorMsg && "auth-input-wrap-error")}>
                      <Ionicons name="mail-outline" size={20} color="#666666" />
                      <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        onChangeText={setEmailAddress}
                        className="auth-input-inner"
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoComplete="email"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <View className={clsx("auth-input-wrap", errorMsg && "auth-input-wrap-error")}>
                      <Ionicons name="lock-closed-outline" size={20} color="#666666" />
                      <TextInput
                        ref={passwordRef}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        className="auth-input-inner"
                        placeholder="Enter your password"
                        returnKeyType="done"
                        onSubmitEditing={onSignInPress}
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666666" />
                      </Pressable>
                    </View>
                  </View>

                  {errorMsg ? (
                    <Text className="auth-error">{errorMsg}</Text>
                  ) : null}

                  <Pressable
                    className={clsx("auth-button", loading && "auth-button-disabled")}
                    onPress={onSignInPress}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="auth-button-text">Sign in</Text>
                    )}
                  </Pressable>

                  <View className="auth-link-row mt-4 mb-2">
                    <Text className="auth-link-copy">New to Renovo?</Text>
                    <Link href="/(auth)/sign-up" asChild>
                      <Pressable>
                        <Text className="auth-link font-sans-medium">Create an account</Text>
                      </Pressable>
                    </Link>
                  </View>

                </View>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
