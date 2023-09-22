import {
  Server,
  ServerCredentials,
  credentials,
  ServerUnaryCall,
  sendUnaryData,
} from "@grpc/grpc-js";
import { describe, it } from "@jest/globals";
import { greeter } from "@/proto/greeter";

describe("tests", () => {
  let server: Server | undefined;

  afterEach(() => {
    server?.forceShutdown();
  });

  it("Can create server and client", (done) => {
    class GreeterService extends greeter.UnimplementedGreeterService {
      greet(
        call: ServerUnaryCall<greeter.GreetRequest, greeter.GreetResponse>,
        callback: sendUnaryData<greeter.GreetResponse>
      ): void {
        return callback(
          null,
          new greeter.GreetResponse({
            message: `Hello ${call.request.name}`,
          })
        );
      }
    }

    server = new Server();
    server.addService(GreeterService.definition, new GreeterService());
    server.bindAsync("0.0.0.0:50051", ServerCredentials.createInsecure(), (err, port) => {
      if (err) {
        throw err;
      }

      server!.start();
      console.log(`Server started on port ${port}`);

      const client = new greeter.GreeterClient(`localhost:${port}`, credentials.createInsecure());

      client.greet(new greeter.GreetRequest({ name: "TomasJS" }), (err, response) => {
        console.log("err", err);

        if (err) {
          done(err);
          throw err;
        }

        console.log("response", response);

        done();
      });
    });
  });
});
