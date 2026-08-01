export default {
  expo: {
    name: 'renovo',
    slug: 'renovo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/assets/images/icon.png',
    scheme: 'renovo',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      '@clerk/expo',
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './assets/assets/fonts/PlusJakartaSans-Regular.ttf',
            './assets/assets/fonts/PlusJakartaSans-Bold.ttf',
            './assets/assets/fonts/PlusJakartaSans-SemiBold.ttf',
            './assets/assets/fonts/PlusJakartaSans-Medium.ttf',
            './assets/assets/fonts/PlusJakartaSans-ExtraBold.ttf',
            './assets/assets/fonts/PlusJakartaSans-Light.ttf',
          ],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    },
  },
}
