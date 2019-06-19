import test from 'ava';
import { TrackedEvent } from 'crosslytics';
import * as request from 'request-promise-native';
import * as sinon from 'sinon';
import { PendoTracker } from './tracker';

class SimpleEvent implements TrackedEvent {
  public name = 'Simple';
  public category = 'Category';
  public argPriority = new Array<never>();
  constructor(public args = {}) {}
}

interface LightsaberArgs {
  'Color': string;
  'Blades': number;
}

class LightsaberBuilt implements TrackedEvent<LightsaberArgs> {
  public name = 'Lightsaber Built';
  public category = 'Lightsabers';
  public argPriority = new Array<keyof LightsaberArgs>('Blades', 'Color');
  constructor(public args: LightsaberArgs) {}
}

const identity = {
  userId: '123456',
};

const simpleEvent = new SimpleEvent();
const realisticEvent = new LightsaberBuilt({
  Blades: 2,
  Color: 'Blue',
});

const createWorkingTracker = () => {
  const tracker = new PendoTracker('accountId');
  tracker.identify(identity);
  tracker.trackEventsKey = 'somefakekey';
  return tracker;
};

test.afterEach(() => {
  sinon.restore();
});

test('track() should throw if no trackEventsKey', async (t) => {
  const tracker = new PendoTracker('accountId');
  tracker.identify(identity);
  await t.throws(tracker.track(simpleEvent));
});

test('track() should throw if no identity', async (t) => {
  const tracker = new PendoTracker('accountId');
  tracker.trackEventsKey = 'somefakekey';
  await t.throws(tracker.track(simpleEvent));
});

test.serial('simple track() should call post() with proper request body', async (t) => {
  const tracker = createWorkingTracker();
  const postStub = sinon.stub(request, 'post');
  await t.notThrows(tracker.track(simpleEvent));
  t.is(postStub.callCount, 1);

  const { headers, body } = postStub.getCall(0).args[1];
  t.true(headers['content-type'] === 'application/json', 'Has content-type header');
  t.true(headers['x-pendo-integration-key'] === tracker.trackEventsKey, 'Has integration key header');
  t.falsy(body.accountId, `Doesn't have accountId`);
  t.falsy(body.context, `Doesn't have context`);
  t.falsy(body.properties, `Doesn't have properties`);
});

test.serial('complex track() should call post() with proper request body', async (t) => {
  const tracker = createWorkingTracker();
  const organizationId = 'testorg';
  tracker.identify({
    ...identity,
    organization: { organizationId },
  });

  tracker.context = {
    ip: 'fakeip',
  };

  const postStub = sinon.stub(request, 'post');
  await t.notThrows(tracker.track(realisticEvent));
  t.is(postStub.callCount, 1);

  const { body } = postStub.getCall(0).args[1];
  t.is(body.accountId, organizationId);
  t.is(body.properties.Blades, 2);
  t.is(body.properties.Color, 'Blue');
  t.is(body.context.ip, 'fakeip');
});
