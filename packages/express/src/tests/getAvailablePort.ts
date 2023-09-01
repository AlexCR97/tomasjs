// TODO Improve getAvailablePort
export function getAvailablePort(): number {
  const min = 11000;
  const max = 91000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
