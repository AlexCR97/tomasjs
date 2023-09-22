import { greeter } from "@/proto/greeter";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { TomasLogger, injectable } from "@tomasjs/core";

@injectable()
export class GreeterService extends greeter.UnimplementedGreeterService {
  greet(
    call: ServerUnaryCall<greeter.GreetRequest, greeter.GreetResponse>,
    callback: sendUnaryData<greeter.GreetResponse>
  ): void {
    const logger = new TomasLogger(GreeterService.name, "error");
    logger.debug("greet");

    return callback(
      null,
      new greeter.GreetResponse({
        message: `Hello ${call.request.name}`,
      })
    );
  }
}
