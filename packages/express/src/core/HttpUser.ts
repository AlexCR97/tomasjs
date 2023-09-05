export class HttpUser {
  constructor(
    readonly authenticated: boolean,
    readonly authorized: boolean,
    readonly claims: Record<string, any> | null
  ) {}
}
