import { classes } from "@automapper/classes";
import { createMapper } from "@automapper/core";

export const Mapper = createMapper({
  strategyInitializer: classes(),
});
