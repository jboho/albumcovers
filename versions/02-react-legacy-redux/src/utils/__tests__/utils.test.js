import hasStorage from '../has-storage';

it('detects that localStorage is available in a jsdom environment', () => {
  expect(hasStorage).toBe(true);
});
