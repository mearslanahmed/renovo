import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import {
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { clsx } from 'clsx';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const onSignUpPress = async () => {
    if (!signUp) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await signUp.create({
        emailAddress,
        password,
      });

      if (result && result.error) {
        setErrorMsg(result.error.message || 'An error occurred during sign up.');
        return;
      }

      await signUp.verifications.sendEmailCode();
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setErrorMsg(err.errors?.[0]?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!signUp) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (result && result.error) {
        setErrorMsg(result.error.message || 'Verification failed.');
        return;
      }

      if (signUp.status === 'complete') {
        await signUp.finalize();
        router.replace('/(tabs)');
      } else {
        console.error(JSON.stringify(signUp, null, 2));
        setErrorMsg('Verification failed.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setErrorMsg(err.errors?.[0]?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
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
              
              <Text className="auth-title">
                {pendingVerification ? "Verify your email" : "Create an account"}
              </Text>
              <Text className="auth-subtitle">
                {pendingVerification 
                  ? "We've sent a verification code to your email address" 
                  : "Join us today to continue managing your subscriptions"}
              </Text>
            </View>

            <View className="auth-card">
              {!pendingVerification && (
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
                      />
                    </View>
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <View className={clsx("auth-input-wrap", errorMsg && "auth-input-wrap-error")}>
                      <Ionicons name="lock-closed-outline" size={20} color="#666666" />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        className="auth-input-inner"
                        placeholder="Enter your password"
                      />
                    </View>
                  </View>

                  {errorMsg ? (
                    <Text className="auth-error">{errorMsg}</Text>
                  ) : null}

                  <Pressable
                    className={clsx("auth-button", loading && "auth-button-disabled")}
                    onPress={onSignUpPress}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="auth-button-text">Create account</Text>
                    )}
                  </Pressable>
                  
                  <View className="auth-link-row mt-4 mb-2">
                    <Text className="auth-link-copy">Already have an account?</Text>
                    <Link href="/(auth)/sign-in" asChild>
                      <Pressable>
                        <Text className="auth-link font-sans-medium">Sign in</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              )}

              {pendingVerification && (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      className={clsx("auth-input", errorMsg && "auth-input-error")}
                      placeholder="Enter 6-digit code"
                      keyboardType="number-pad"
                    />
                  </View>

                  {errorMsg ? (
                    <Text className="auth-error">{errorMsg}</Text>
                  ) : null}

                  <Pressable
                    className={clsx("auth-button", loading && "auth-button-disabled")}
                    onPress={onPressVerify}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="auth-button-text">Verify Email</Text>
                    )}
                  </Pressable>

                  <View className="auth-link-row mt-4 mb-2">
                    <Text className="auth-link-copy">Need to use a different email?</Text>
                    <Pressable onPress={() => setPendingVerification(false)}>
                      <Text className="auth-link font-sans-medium">Go back</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
