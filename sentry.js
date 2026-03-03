import * as Sentry from "@sentry/react";
Sentry.init({
    enabled: import.meta.env.PROD,
    dsn: "https://82fb633a151819a31e5b646e11cc6a84@o4510683943469056.ingest.us.sentry.io/4510683944452096",
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    integrations: [
        // If you're using react router, use the integration for your react router version instead.
        // Learn more at
        // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/

        // All integrations are moved to react router integration
    ],
    // Enable logs to be sent to Sentry
    enableLogs: true,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    tracePropagationTargets: [/^\//, /^https:\/\/yourserver\.io\/api/],
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});
