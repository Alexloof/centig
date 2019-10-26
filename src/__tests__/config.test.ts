import { Greeter } from '../config';
test('My Greeter', () => {
  expect(Greeter('Carl')).toBe('Hello Carl');
});
