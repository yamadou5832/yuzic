import * as amplitude from '@amplitude/analytics-react-native';

let initialized = false;
let enabled = false;

export async function initAnalytics() {
  if (initialized || !enabled) return;

  initialized = true;

  await amplitude
    .init(
      '483138e19d670240cdc04411ad13aec9',
      undefined,
      {
        disableCookies: true,
      }
    )
    .promise;
}

export async function enableAnalytics() {
  if (enabled) return;
  enabled = true;
  await initAnalytics();
}

export function disableAnalytics() {
  if (!enabled) return;

  enabled = false;
  initialized = false;

  amplitude.setUserId(undefined);
  amplitude.reset();
}

export function track(
  eventName: string,
  properties?: Record<string, any>
) {
  if (!enabled || !initialized) return;
  amplitude.track(eventName, properties);
}

export { amplitude };