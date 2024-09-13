import { Readable } from "node:stream";

/**
 * Reads the entire data from a {@link Readable} stream and concatenates it into a single {@link Buffer}.
 *
 * This function collects all chunks of data from the provided readable stream and combines them
 * into a single `Buffer` once the stream ends.
 *
 * @param {Readable} stream - The stream from which to read data.
 * @returns {Promise<Buffer>} A promise that resolves to a {@link Buffer} containing all the data read from the stream.
 *
 * @example
 * import { Readable } from 'node:stream';
 * import { readToBuffer } from '@tomasjs/core/system/streams';
 *
 * async function example() {
 *   const readableStream = Readable.from(['Hello ', 'World!']);
 *   try {
 *     const buffer = await readToBuffer(readableStream);
 *     console.log(buffer.toString()); // Output: 'Hello World!'
 *   } catch (error) {
 *     console.error('Error reading stream:', error);
 *   }
 * }
 */
export async function readToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    stream.on("data", (bytes: Uint8Array) => {
      chunks.push(bytes);
    });

    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}
