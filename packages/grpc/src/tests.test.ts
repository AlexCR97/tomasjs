import { Server, ServerCredentials, handleUnaryCall, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { describe, it } from "@jest/globals";
import path from "path";
import { env } from "./env";

describe("tests", () => {
  it("Can create a server", (done) => {
    const protoPath = path.join(env.host.proto.path, "greeter.proto");

    const packageDefinition = loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const grpcObject = loadPackageDefinition(packageDefinition);

    const $package = grpcObject.greeter;

    const server = new Server();

    const greet: handleUnaryCall<any, any> = (call, callback) => {
      callback(null, { message: `Hello ${call.request.name}` });
    };

    server.addService(($package as any).Greeter.service, {
      greet,
    });

    server.bindAsync("0.0.0.0:50050", ServerCredentials.createInsecure(), (err, port) => {
      if (err) {
        throw err;
      }

      server.start();
      console.log(`Server started on port ${port}`);

      server.forceShutdown();
      console.log("Server shutdown");

      done();
    });
  });
});
