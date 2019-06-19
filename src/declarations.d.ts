// From https://help.pendo.io/resources/support-library/api/index.html?bash#the-track-object
// TODO: PR to DefinitelyTyped

export interface TrackContext {
  ip?: string;
  userAgent?: string;
  /**
   * Fully-qualified url, e.g. https://crosslead.com/about/
   */
  url?: string;
  title?: string;
}
