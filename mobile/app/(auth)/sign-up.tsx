import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { usePostHog } from 'posthog-react-native';
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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { clsx } from 'clsx';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const passwordRef = useRef<TextInput>(null);

  const onSignUpPress = async () => {
    if (!signUp) return;
    setLoading(true);
    setErrorMsg('');
    Keyboard.dismiss();

    try {
      const result = await signUp.create({
        emailAddress,
        password,
      });

      if (result && result.error) {
        const message = result.error.message || 'An error occurred during sign up.';
        setErrorMsg(message);
        posthog.capture('sign_up_failed', { error_message: message, step: 'create' });
        return;
      }

      await signUp.verifications.sendEmailCode();
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.message || 'An error occurred.';
      setErrorMsg(message);
      posthog.capture('sign_up_failed', { error_message: message, step: 'create' });
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!signUp) return;
    setLoading(true);
    setErrorMsg('');
    Keyboard.dismiss();

    posthog.capture('email_verification_submitted');

    try {
      const result = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (result && result.error) {
        const message = result.error.message || 'Verification failed.';
        setErrorMsg(message);
        posthog.capture('sign_up_failed', { error_message: message, step: 'verify' });
        return;
      }

      if (signUp.status === 'complete') {
        await setActive({ session: signUp.createdSessionId });
        posthog.identify(emailAddress, {
          email: emailAddress,
          $set_once: { first_sign_up_date: new Date().toISOString() },
        });
        posthog.capture('user_signed_up');
        // The AuthLayout will automatically redirect to /(tabs) when isSignedIn becomes true
      } else {
        console.error("Sign up incomplete. Status:", signUp.status);
        setErrorMsg(`Verification incomplete (Status: ${signUp.status})`);
        posthog.capture('sign_up_failed', { error_message: `Incomplete status: ${signUp.status}`, step: 'verify' });
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.message || 'An error occurred.';
      setErrorMsg(message);
      posthog.capture('sign_up_failed', { error_message: message, step: 'verify' });
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
                
                <Text className="auth-title">Create Account</Text>
                <Text className="auth-subtitle">
                  {pendingVerification 
                    ? "We've sent a verification code to your email." 
                    : "Sign up to start tracking and optimizing your subscriptions"}
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
                          onSubmitEditing={onSignUpPress}
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
                      <View className={clsx("auth-input-wrap", errorMsg && "auth-input-wrap-error")}>
                        <Ionicons name="keypad-outline" size={20} color="#666666" />
                        <TextInput
                          value={code}
                          onChangeText={setCode}
                          className="auth-input-inner"
                          placeholder="Enter 6-digit code"
                          keyboardType="number-pad"
                          returnKeyType="done"
                          onSubmitEditing={onPressVerify}
                        />
                      </View>
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
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
