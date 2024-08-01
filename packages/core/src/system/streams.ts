import { Readable } from "node:stream";

export async function readToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Uint8Array[] = [];

    stream.on("data", (bytes: Uint8Array) => {
      chunks.push(bytes);
    });

    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      return resolve(buffer);
    });
  });
}
