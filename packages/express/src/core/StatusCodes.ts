/**
 * More info on status codes at https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export enum StatusCodes {
  /* #region Successful responses */

  /**
   * The request succeeded. The result meaning of "success" depends on the HTTP method:
   *
   * GET: The resource has been fetched and transmitted in the message body.
   *
   * HEAD: The representation headers are included in the response without any message body.
   *
   * PUT or POST: The resource describing the result of the action is transmitted in the message body.
   *
   * TRACE: The message body contains the request message as received by the server.
   */
  ok = 200,

  /** The request succeeded, and a new resource was created as a result. This is typically the response sent after POST requests, or some PUT requests. */
  created = 201,

  /** There is no content to send for this request, but the headers may be useful. The user agent may update its cached headers for this resource with the new ones. */
  noContent = 204,

  /* #endregion */

  /* #region Client error responses */

  /** The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing). */
  badRequest = 400,

  /** Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response. */
  unauthorized = 401,

  /** The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server. */
  forbidden = 403,

  /** The server cannot find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web. */
  notFound = 404,

  /** This response is sent when a request conflicts with the current state of the server. */
  conflict = 409,

  /* #endregion */

  /* #region Server error responses */

  /** The server has encountered a situation it does not know how to handle. */
  internalServerError = 500,

  /** The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD. */
  notImplemented = 501,

  /** The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This response should be used for temporary conditions and the Retry-After HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached. */
  serviceUnavailable = 503,

  /* #endregion */
}
