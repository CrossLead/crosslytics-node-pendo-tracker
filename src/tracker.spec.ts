import test from 'ava';
import { TrackedEvent } from 'crosslytics';
import { SampleTracker } from './tracker';

interface LightsaberArgs {
  'Color': string;
  'Blades': number;
}

class LightsaberBuilt extends TrackedEvent<LightsaberArgs> {
  public name = 'Lightsaber Built';
  public category = 'Lightsabers';
  public argPriority = new Array<keyof LightsaberArgs>('Blades', 'Color');
}

test('Should return what you expect', async (t) => {
  const identity = {
    organization: {
      organizationId: 'city1000',
      traits: {
        name: 'Jedi Council',
      },
    },
    traits: {
      email: 'obiwan@starwars.com',
      name: 'Obi-wan Kenobi',
    },
    userId: '123456',
  };

  const event = new LightsaberBuilt({
    Blades: 2,
    Color: 'Blue',
  });

  const tracker = new SampleTracker('accountId');
  await t.notThrows(tracker.track(event));
});
