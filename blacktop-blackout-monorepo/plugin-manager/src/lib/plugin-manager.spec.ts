import { pluginManager } from './plugin-manager.js';

describe('pluginManager', () => {
  it('should work', () => {
    expect(pluginManager()).toEqual('plugin-manager');
  });
});
