# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Renovo, a React Native / Expo subscription management app. The integration covers the full auth funnel (sign-up, email verification, sign-in), key engagement interactions (subscription cards, add subscription, insights tab), and the sign-out churn signal. Users are identified by email address consistently across sign-in, sign-up, and session restore. PostHog is initialised via a standalone `lib/posthog.ts` config file and wired into the app root through `PostHogProvider` with manual Expo Router screen tracking.

## Changes made

| File | What changed |
|------|-------------|
| `lib/posthog.ts` | **Created** — PostHog client instance, reads token/host from `Constants.expoConfig.extra`, guarded init with loud dev-mode warning when unconfigured |
| `app.config.js` | **Created** — converts `app.json` to JS config, exposes `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` env vars as `extra.posthogProjectToken` / `extra.posthogHost` |
| `.env` | **Updated** — added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` |
| `app/_layout.tsx` | **Updated** — added `PostHogProvider` wrapping the `Stack`, manual screen tracking via `useEffect` + `posthog.screen()` on `pathname` changes |
| `app/(auth)/sign-in.tsx` | **Updated** — `posthog.identify(email)` + `posthog.capture('user_signed_in')` on success; `posthog.capture('sign_in_failed', { error_message })` on failure |
| `app/(auth)/sign-up.tsx` | **Updated** — `posthog.capture('email_verification_submitted')` on verification attempt; `posthog.identify(email)` + `posthog.capture('user_signed_up')` on completion; `posthog.capture('sign_up_failed', { step })` on any error |
| `app/(tabs)/_layout.tsx` | **Updated** — `posthog.identify(email)` via `useEffect` when Clerk `isSignedIn && user` — handles returning-visitor session restore |
| `app/(tabs)/settings.tsx` | **Updated** — `posthog.capture('user_signed_out')` + `posthog.reset()` before Clerk `signOut()` |
| `app/(tabs)/index.tsx` | **Updated** — `posthog.capture('add_subscription_tapped')` on the add-icon press; `posthog.capture('subscription_card_expanded', { subscription_id })` when a card is expanded |
| `app/Subscriptions/[id].tsx` | **Updated** — `posthog.capture('subscription_viewed', { subscription_id })` in a `useEffect` on mount |
| `app/(tabs)/insights.tsx` | **Updated** — `posthog.capture('insights_viewed')` in a `useEffect` on mount |
| `app/onboarding.tsx` | **Updated** — `posthog.capture('onboarding_started')` in a `useEffect` on mount |

## Events instrumented

| Event name | Description | File |
|-----------|-------------|------|
| `user_signed_in` | User successfully completes sign-in with email and password. | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | User's sign-in attempt fails due to invalid credentials or an error. | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User successfully completes account creation and email verification. | `app/(auth)/sign-up.tsx` |
| `email_verification_submitted` | User submits the email verification code during the sign-up flow. | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | User's sign-up or email verification step fails with an error. | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User taps the log out button and signs out of their account. | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User taps a subscription card on the home screen to expand its details. | `app/(tabs)/index.tsx` |
| `add_subscription_tapped` | User taps the add icon to begin adding a new subscription. | `app/(tabs)/index.tsx` |
| `subscription_viewed` | User opens the subscription details screen for a specific subscription. | `app/Subscriptions/[id].tsx` |
| `insights_viewed` | User navigates to the Insights tab, the top of the insights funnel. | `app/(tabs)/insights.tsx` |
| `onboarding_started` | User sees the onboarding screen, marking the start of the onboarding funnel. | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics (wizard)](https://eu.posthog.com/project/233685/dashboard/852814)
- **Sign-up & sign-in funnel**: [https://eu.posthog.com/project/233685/insights/CbC0Xlnl](https://eu.posthog.com/project/233685/insights/CbC0Xlnl)
- **Daily sign-ins & sign-ups**: [https://eu.posthog.com/project/233685/insights/Nb12uwnD](https://eu.posthog.com/project/233685/insights/Nb12uwnD)
- **Sign-in failure rate**: [https://eu.posthog.com/project/233685/insights/0DDWKgGr](https://eu.posthog.com/project/233685/insights/0DDWKgGr)
- **Subscription engagement**: [https://eu.posthog.com/project/233685/insights/C6i80ZCx](https://eu.posthog.com/project/233685/insights/C6i80ZCx)
- **User churn — sign-outs**: [https://eu.posthog.com/project/233685/insights/Mcz2aant](https://eu.posthog.com/project/233685/insights/Mcz2aant)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names (`POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST`) to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — the `(tabs)/_layout.tsx` handler identifies on session restore, but verify this fires correctly for users who reopen the app without signing out.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
