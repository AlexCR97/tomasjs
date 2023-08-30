<script setup lang="ts">
import { MenuItem } from "utils";

const useControllersSection: MenuItem = {
  id: "useControllersSection",
  to: `#useControllersSection`,
  label: "UseControllers",
};

const theControllerDecoratorSection: MenuItem = {
  id: "theControllerDecoratorSection",
  to: `#theControllerDecoratorSection`,
  label: "The @controller decorator",
};

const httpMethodsSection: MenuItem = {
  id: "httpMethodsSection",
  to: `#httpMethodsSection`,
  label: "HTTP Methods",
};

const responsesSection: MenuItem = {
  id: "responsesSection",
  to: `#responsesSection`,
  label: "Responses",
};

const routeParamsSection: MenuItem = {
  id: "routeParamsSection",
  to: `#routeParamsSection`,
  label: "Route Params",
};

const queryParamsSection: MenuItem = {
  id: "queryParamsSection",
  to: `#queryParamsSection`,
  label: "Query Params",
};

const requestBodySection: MenuItem = {
  id: "requestBodySection",
  to: `#requestBodySection`,
  label: "Request Body",
};

const headersSection: MenuItem = {
  id: "headers",
  to: `#headers`,
  label: "Headers",
};

const nextStepsSection: MenuItem = {
  id: "nextSteps",
  to: "#nextSteps",
  label: "Next Steps",
};

const onThisPageItems: MenuItem[] = [
  useControllersSection,
  theControllerDecoratorSection,
  httpMethodsSection,
  responsesSection,
  routeParamsSection,
  queryParamsSection,
  requestBodySection,
  headersSection,
  nextStepsSection,
];
</script>

<template>
  <NuxtLayout name="article">
    <template #sidebarLeft>
      <DocsSidebarLeft />
    </template>

    <main class="container py-4">
      <h3 class="mb-5">Controllers</h3>

      <section
        :id="useControllersSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ useControllersSection.label }}</h4>

        <Code
          code="
await new ExpressAppBuilder()
  .use(new UseControllers({
    // The controllers to bind into your http pipeline.
    controllers: [],

    // A logger that you can use to debug the bootstrapping process.
    logger: undefined,
  }))
  .buildAsync();
          " />
      </section>

      <section
        :id="theControllerDecoratorSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ theControllerDecoratorSection.label }}</h4>

        <Code
          code="
@controller()
class RootController {}

@controller('path/to/your/resources')
class PathController {}

await new ExpressAppBuilder()
  .use(new UseControllers({
    controllers: [RootController, PathController],
  }))
  .buildAsync();
          " />
      </section>

      <section
        :id="httpMethodsSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ httpMethodsSection.label }}</h4>

        <Code
          code="
@controller()
class Controller {
  @httpGet() // Defines a GET request
  getRequest() {
    return new OkResponse();
  }

  @httpPost() // Defines a POST request
  postRequest() {
    return new OkResponse();
  }

  @httpPut() // Defines a PUT request
  putRequest() {
    return new OkResponse();
  }

  @httpPatch() // Defines a PATCH request
  patchRequest() {
    return new OkResponse();
  }

  @httpDelete() // Defines a DELETE request
  deleteRequest() {
    return new OkResponse();
  }
}

@controller('paths')
class PathsController {
  @httpGet('path/to/resource') // Just like controllers, http methods can have a path
  getRequest() {
    return new OkResponse();
  }
}
          " />
      </section>

      <section
        :id="responsesSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ responsesSection.label }}</h4>

        <Code
          code="
@controller()
class Controller {
  @httpGet('status')
  statusCodeResponse() {
    return new StatusCodeResponse(statusCodes.ok);
  }

  @httpGet('status/shorthand')
  statusCodeShorthandResponse() {
    return new OkResponse();

    // Also available:
    new CreatedResponse();
    new NoContentResponse();
    new BadRequestResponse();
    new UnauthorizedResponse();
    new ForbiddenResponse();
    new NotFoundResponse();
    new ConflictResponse();
    new InternalServerErrorResponse();
    new NotImplementedResponse();
    new ServiceUnavailableResponse();
  }

  @httpGet('json')
  jsonResponse() {
    return new JsonResponse({
      // This is your json response
    },
    {
      // An optional status code. The default is 200.
      status: undefined,
    });
  }

  @httpGet('plaintext')
  plainTextResponse() {
    return new PlainTextResponse('This is your plain text', {
      // An optional status code. The default is 200.
      status: undefined,
    });
  }

  @httpGet('problemdetails')
  problemDetailsResponse() {
    return new ProblemDetailsResponse(
      new ProblemDetails({
        // This is your problem details instance
      })
    );
  }

  @httpGet('default')
  defaultResponse() {
    // You can return just about whatever you want and TomasJS
    // will respond with that value and an 'Ok' status.
    return 1;
    return 'a string';
    return { content: 'A plain old json' };
    return new InstanceOfSomeClass(); // Will be returned as json
  }
}
          " />
      </section>

      <section
        :id="routeParamsSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ routeParamsSection.label }}</h4>

        <Code
          code="
@controller()
class Controller {
  @httpGet('path/to/resource/:id')
  getRequest(@param('id') id: string) {
    return new OkResponse();
  }

  @httpGet('path/to/resource/:id/nested/:nestedId')
  getRequestNested(@param('id') id: string, @param('nestedId') nestedId: string) {
    return new OkResponse();
  }
}
          " />
      </section>

      <section
        :id="queryParamsSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ queryParamsSection.label }}</h4>

        <Code
          code="
@controller()
class Controller {
  @httpGet('single')
  singleQueryParam(@query('filter') filter: string) {
    return new OkResponse();
  }

  @httpGet('all')
  allQueryParams(@query() query: unknown) {
    return new OkResponse();
  }
}
          " />
      </section>

      <section
        :id="requestBodySection.id"
        class="mb-5">
        <h4 class="mb-4">{{ requestBodySection.label }}</h4>

        <Code
          code="
@controller()
class Controller {
  @httpPost('path/to/resource')
  postRequest(@body() request: unknown) {
    return new OkResponse();
  }
}
          " />
      </section>

      <section
        :id="headersSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ headersSection.label }}</h4>

        <Code
          code="
@controller()
class Controller {
  @httpGet('single')
  singleHeader(@header('Authorization') authorizationHeader: string) {
    return new OkResponse();
  }

  @httpGet('all')
  allHeaders(@headers() headers: Headers) {
    return new OkResponse();
  }
}
          " />
      </section>

      <section
        :id="nextStepsSection.id"
        class="mb-5">
        <p class="fw-bold">{{ nextStepsSection.label }}</p>
        <ul>
          <li>
            <NuxtLink to="/docs/web-api/middlewares">Middlewares</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
