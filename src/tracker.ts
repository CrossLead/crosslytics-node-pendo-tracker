import { Identity, TrackedEvent, Tracker } from 'crosslytics';

export class SampleTracker {
  public async track<T>(identity: Identity, event: TrackedEvent<T>) {
    // Submit event data to your 3rd party service here
    return 'Great success';
  }
}
