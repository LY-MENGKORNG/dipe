export type HttpRequest<T = unknown> = {
  clone: () => HttpRequest<T>;
  json: <J = T>() => Promise<J>;
} & Request;
