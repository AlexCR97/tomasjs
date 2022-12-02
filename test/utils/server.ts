export async function tryCloseServerAsync(server: any) {
  if (server === undefined || server === null) {
    return;
  }

  await new Promise<void>((resolve) => {
    server.close(() => {
      server = undefined;
      resolve();
    });
  });
}
