import { AnalyticsBrowser } from '@segment/analytics-next';
import { IdentifyParams } from '@segment/analytics-next/dist/types/core/arguments-resolver';

class Analytics extends AnalyticsBrowser {
  public hasCalledIdentify: boolean = false;

  public segmentIdentify(...args: IdentifyParams) {
    if (!this.hasCalledIdentify) {
      this.identify(...args);
      this.hasCalledIdentify = true;
    }
  }
}

export const analytics = new Analytics();

// TODO: check if the user has signed the terms and conditions or can we assume if they're using
// analytics it means thay have already signed since only on authenticated pages?
// except i need to do that identify call after login...and that happens before teh
// consent page
analytics.load({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_ANALYTICS_KEY,
});
