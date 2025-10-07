const detox = require('detox');
const config = require('../.detoxrc.json');

beforeAll(async () => {
  await detox.init(config, { initGlobals: true });
}, 300000);

afterAll(async () => {
  await detox.cleanup();
});


