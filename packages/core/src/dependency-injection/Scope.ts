const scopes = ["singleton", "scoped"] as const;

export type Scope = (typeof scopes)[number];

export function isScope(obj: any): obj is Scope {
  return scopes.includes(obj);
}
