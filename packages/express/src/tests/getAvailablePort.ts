function* portGenerator(): Generator<number, number> {
  let port = 13000;

  while (true) {
    yield port++;
  }
}

export function getAvailablePort(): number {
  return portGenerator().next().value;
}
