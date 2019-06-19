import { Identity, Page, TrackedEvent, Tracker } from 'crosslytics';
import * as request from 'request-promise-native';
import { TrackContext } from './declarations';

const enum PendoUrls {
  TrackEndpoint = 'https://app.pendo.io/data/track',
  Help = 'https://help.pendo.io/resources/support-library/api/index.html?bash#report',
}

export class PendoTracker implements Tracker {
  /**
   * Persist the user's context across multiple track() calls.
   * @see https://help.pendo.io/resources/support-library/api/index.html?bash#track
   */
  public context?: TrackContext;
  protected identity: Identity;

  /**
   * ID here refers to your Pendo Integration Key
   * @see https://help.pendo.io/resources/support-library/api/index.html?bash#authentication
   * @param id string Pendo Integration Key
   * @param [trackEventsKey]
   */
  constructor(public id: string, public trackEventsKey?: string) {}

  /**
   * The Pendo server API does *not* support calls to identify()
   * like the browser Agent API. Thus this tracker only records
   * the supplied `identity.userId` as the Pendo Visitor ID and
   * `identity.organization.organizationId` as the Account ID
   * @param identity Identity
   */
  public identify(identity: Identity) {
    this.identity = identity;
  }

  /**
   * Pendo currently does not support manual pageview tracking,
   * so this method is a noop.
   * @param page
   */
  public async page(page: Page) {
    return;
  }

  public async track<T>(event: TrackedEvent<T>) {
    if (!this.trackEventsKey) {
      throw new Error(`trackEventsKey required. See ${PendoUrls.Help}`);
    }

    if (!this.identity) {
      throw new Error(`No identity specified. Required for Pendo server API`);
    }

    // TODO: refactor header and body generation if we add more endpoints
    return request.post(PendoUrls.TrackEndpoint, {
      body: {
        ...(this.identity.organization && { accountId: this.identity.organization.organizationId }),
        event: event.name,
        timestamp: Date.now(),
        type: 'track',
        visitorId: this.identity.userId,
        ...(this.context && { context: this.context }),
        ...(event.args && Object.keys(event.args).length && { properties: event.args }),
      },
      headers: {
        'content-type': 'application/json',
        'x-pendo-integration-key': this.trackEventsKey,
      },
      json: true,
    });
  }
}
