import { HttpMethod } from "@/HttpMethod";
import { ControllerAction, ControllerActionMap, ControllerMiddleware } from "./types";

export abstract class Controller {
  /* #region Route */

  path?: string; // TODO Mark as private

  route(path: string): Controller {
    this.path = path;
    return this;
  }

  /* #endregion */

  /* #region On Before Middleware */

  readonly onBeforeMiddlewares: ControllerMiddleware[] = []; // TODO Mark as private

  onBefore(middleware: ControllerMiddleware): Controller {
    this.onBeforeMiddlewares.push(middleware);
    return this;
  }

  /* #endregion */

  /* #region Actions */

  readonly actions: ControllerActionMap[] = []; // TODO Mark as private

  get(path: string, ...actions: ControllerAction[]): Controller {
    return this.registerAction("get", path, ...actions);
  }

  post(path: string, ...actions: ControllerAction[]): Controller {
    return this.registerAction("post", path, ...actions);
  }

  put(path: string, ...actions: ControllerAction[]): Controller {
    return this.registerAction("put", path, ...actions);
  }

  patch(path: string, ...actions: ControllerAction[]): Controller {
    return this.registerAction("patch", path, ...actions);
  }

  delete(path: string, ...actions: ControllerAction[]): Controller {
    return this.registerAction("delete", path, ...actions);
  }

  private registerAction(
    method: HttpMethod,
    path: string,
    ...actions: ControllerAction[]
  ): Controller {
    this.actions.push({
      method,
      path,
      actions,
    });
    return this;
  }

  /* #endregion */
}

// export abstract class ThomasController {
//   /* #region Route */

//   path?: string; // TODO Mark as private

//   route(path: string): ThomasController {
//     this.path = path;
//     return this;
//   }

//   /* #endregion */

//   /* #region On Before Middleware */

//   readonly onBeforeMiddlewares: ThomasControllerMiddleware[] = []; // TODO Mark as private

//   onBefore(middleware: ThomasControllerMiddleware): ThomasController {
//     this.onBeforeMiddlewares.push(middleware);
//     return this;
//   }

//   /* #endregion */

//   /* #region Actions */

//   readonly actions: ControllerActionMap[] = []; // TODO Mark as private

//   get(path: string, ...actions: ControllerAction[]): Controller {
//     return this.registerAction("get", path, ...actions);
//   }

//   post(path: string, ...actions: ControllerAction[]): Controller {
//     return this.registerAction("post", path, ...actions);
//   }

//   put(path: string, ...actions: ControllerAction[]): Controller {
//     return this.registerAction("put", path, ...actions);
//   }

//   patch(path: string, ...actions: ControllerAction[]): Controller {
//     return this.registerAction("patch", path, ...actions);
//   }

//   delete(path: string, ...actions: ControllerAction[]): Controller {
//     return this.registerAction("delete", path, ...actions);
//   }

//   private registerAction(
//     method: HttpMethod,
//     path: string,
//     ...actions: ControllerAction[]
//   ): Controller {
//     this.actions.push({
//       method,
//       path,
//       actions,
//     });
//     return this;
//   }

//   /* #endregion */
// }
