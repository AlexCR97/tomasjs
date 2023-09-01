// TODO Improve getAvailablePort
export function getAvailablePort(): number {
  const min = 10000;
  const max = 65536;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
