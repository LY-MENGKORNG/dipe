export type HttpResponse<T = unknown> = {
  clone: () => HttpResponse<T>
  json: <J = T>() => Promise<J>
} & Response
