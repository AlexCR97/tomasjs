export function tick(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

export async function tryCloseServerAsync(server: any): Promise<void> {
  if (server === undefined || server === null) {
    return;
  }

  if (server.close === undefined || server.close === null) {
    return;
  }

  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}
