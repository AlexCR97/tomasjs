import { HttpClient } from "./HttpClient";
import { HttpHeaders } from "./HttpHeaders";
import { HttpRequest } from "./HttpRequest";
import {
  IRequestInterceptor,
  IResponseInterceptor,
  RequestInterceptorFunction,
  RequestInterceptorResult,
  ResponseInterceptor,
  ResponseInterceptorFunction,
} from "./Interceptor";

describe("HttpClient", () => {
  describe("GET", () => {
    const getUrl = "https://jsonplaceholder.typicode.com/todos/1";

    const getResponse = {
      id: 1,
      title: "delectus aut autem",
      completed: false,
      userId: 1,
    };

    type GetResponseType = typeof getResponse;

    describe("send", () => {
      it("should send a PlainHttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.send({
          method: "get",
          url: getUrl,
        });

        expect(response.ok).toBe(true);
      });

      it("should send an HttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.send(new HttpRequest("get").withUrl(getUrl));

        expect(response.ok).toBe(true);
      });

      it("should send a short-handed request", async () => {
        const client = new HttpClient();

        const response = await client.send("get", getUrl);

        expect(response.ok).toBe(true);
      });

      it("should send a short-handed request with options", async () => {
        const client = new HttpClient();

        const response = await client.send("get", getUrl, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
        });

        expect(response.ok).toBe(true);
      });

      it("should deserialize a json response", async () => {
        const client = new HttpClient();

        const response = await client.send("get", getUrl, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
        });

        expect(response.ok).toBe(true);

        const json = await response.json();

        expect(json).toMatchObject(getResponse);
      });
    });

    describe("sendJson", () => {
      it("should send a PlainHttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.sendJson<GetResponseType>({
          method: "get",
          url: getUrl,
        });

        expect(response).toMatchObject(getResponse);
      });

      it("should send an HttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.sendJson<GetResponseType>(
          new HttpRequest("get").withUrl(getUrl)
        );

        expect(response).toMatchObject(getResponse);
      });

      it("should send a short-handed request", async () => {
        const client = new HttpClient();

        const response = await client.sendJson<GetResponseType>("get", getUrl);

        expect(response).toMatchObject(getResponse);
      });

      it("should send a short-handed request with options", async () => {
        const client = new HttpClient();

        const response = await client.sendJson<GetResponseType>("get", getUrl, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
        });

        expect(response).toMatchObject(getResponse);
      });
    });
  });

  describe("POST", () => {
    const postUrl = "https://jsonplaceholder.typicode.com/posts";

    const postRequest = JSON.stringify({
      title: "foo",
      body: "bar",
      userId: 1,
    });

    const postResponse = {
      id: 101,
    };

    type PostResponseType = typeof postResponse;

    describe("send", () => {
      it("should send a PlainHttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.send({
          method: "post",
          url: postUrl,
          body: postRequest,
          headers: {
            "Content-Type": "application/json",
          },
        });

        expect(response.ok).toBe(true);
      });

      it("should send an HttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.send(
          new HttpRequest("post").withUrl(postUrl).withBody(postRequest)
        );

        expect(response.ok).toBe(true);
      });

      it("should send a short-handed request", async () => {
        const client = new HttpClient();

        const response = await client.send("post", postUrl, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
          body: postRequest,
        });

        expect(response.ok).toBe(true);
      });

      it("should deserialize a json response", async () => {
        const client = new HttpClient();

        const response = await client.send("post", postUrl, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
          body: postRequest,
        });

        expect(response.ok).toBe(true);

        const json = await response.json();

        expect(json).toMatchObject(postResponse);
      });
    });

    describe("sendJson", () => {
      it("should send a PlainHttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.sendJson<PostResponseType>({
          method: "post",
          url: postUrl,
          body: postRequest,
          headers: {
            "Content-Type": "application/json",
          },
        });

        expect(response).toMatchObject(postResponse);
      });

      it("should send an HttpRequest", async () => {
        const client = new HttpClient();

        const response = await client.sendJson<PostResponseType>(
          new HttpRequest("post").withUrl(postUrl).withBody(postRequest)
        );

        expect(response).toMatchObject(postResponse);
      });

      it("should send a short-handed request", async () => {
        const client = new HttpClient();

        const response = await client.sendJson<PostResponseType>("post", postUrl, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
          body: postRequest,
        });

        expect(response).toMatchObject(postResponse);
      });
    });

    describe("post", () => {
      it("should post json", async () => {
        const client = new HttpClient();

        const response = await client.post(postUrl, postRequest);

        expect(response.ok).toBe(true);

        const json = await response.json();

        expect(json).toMatchObject(postResponse);
      });

      it("should post json with options", async () => {
        const client = new HttpClient();

        const response = await client.post(postUrl, postRequest, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
        });

        expect(response.ok).toBe(true);

        const json = await response.json();

        expect(json).toMatchObject(postResponse);
      });
    });

    describe("postJson", () => {
      it("should post json", async () => {
        const client = new HttpClient();

        const response = await client.postJson<PostResponseType>(postUrl, postRequest);

        expect(response).toMatchObject(postResponse);
      });

      it("should post json with options", async () => {
        const client = new HttpClient();

        const response = await client.postJson<PostResponseType>(postUrl, postRequest, {
          headers: new HttpHeaders().add("Content-Type", "application/json"),
        });

        expect(response).toMatchObject(postResponse);
      });
    });
  });

  describe("constructor", () => {
    const baseUrl = "https://jsonplaceholder.typicode.com/";
    const resourceUrl = "todos/1";

    it("should use baseUrl", async () => {
      const urls: { baseUrl: string; resourceUrl: string }[] = [
        {
          baseUrl: "https://jsonplaceholder.typicode.com",
          resourceUrl: "todos/1",
        },
        {
          baseUrl: "https://jsonplaceholder.typicode.com/",
          resourceUrl: "todos/1",
        },
        {
          baseUrl: "https://jsonplaceholder.typicode.com/",
          resourceUrl: "/todos/1",
        },
        {
          baseUrl: "https://jsonplaceholder.typicode.com",
          resourceUrl: "/todos/1",
        },
      ];

      for (const { baseUrl, resourceUrl } of urls) {
        const client = new HttpClient({ baseUrl });
        const response = await client.get(resourceUrl);
        expect(response.ok).toBe(true);
      }
    });

    it("should use RequestInterceptorFunction", async () => {
      const requestInterceptor: RequestInterceptorFunction = async (request) => {
        request.withHeaders((h) => h.add("X-CustomHeader", "Test!"));
        return request;
      };

      const client = new HttpClient({ baseUrl, requestInterceptor });
      const response = await client.get(resourceUrl);
      expect(response.ok).toBe(true);
    });

    it("should use RequestInterceptor instance", async () => {
      class MyRequestInterceptor implements IRequestInterceptor {
        async intercept(request: HttpRequest): Promise<RequestInterceptorResult> {
          request.withHeaders((h) => h.add("X-CustomHeader", "Test!"));
          return request;
        }
      }

      const client = new HttpClient({ baseUrl, requestInterceptor: new MyRequestInterceptor() });
      const response = await client.get(resourceUrl);
      expect(response.ok).toBe(true);
    });

    it("should use ResponseInterceptorFunction", async () => {
      const responseInterceptor: ResponseInterceptorFunction = async (response) => {
        if (!response.ok) {
          // Handle error (in a non-test scenario)
        }

        return response;
      };

      const client = new HttpClient({ baseUrl, responseInterceptor });
      await client.get(resourceUrl);
    });

    it("should use ResponseInterceptor instance", async () => {
      class MyResponseInterceptor implements IResponseInterceptor {
        async intercept(response: Response): Promise<Response> {
          if (!response.ok) {
            // Handle error (in a non-test scenario)
          }

          return response;
        }
      }

      const client = new HttpClient({ baseUrl, responseInterceptor: new MyResponseInterceptor() });
      await client.get(resourceUrl);
    });
  });
});
