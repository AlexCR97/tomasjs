import { greeter } from "@/proto/greeter";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
  ServiceProvider,
  TomasLogger,
  inject,
  injectable,
  serviceProviderToken,
} from "@tomasjs/core";

@injectable()
export class GreeterService extends greeter.UnimplementedGreeterService {
  //@ts-ignore
  private readonly logger = new TomasLogger(GreeterService.name, "debug");

  constructor(
    //@ts-ignore
    @inject(serviceProviderToken) private readonly services: ServiceProvider
  ) {
    super();
  }

  greet(
    call: ServerUnaryCall<greeter.GreetRequest, greeter.GreetResponse>,
    callback: sendUnaryData<greeter.GreetResponse>
  ): void {
    this.logger.debug("greet", { services: this.services, request: call.request });

    return callback(
      null,
      new greeter.GreetResponse({
        message: `Hello ${call.request.name}`,
      })
    );
  }
}
