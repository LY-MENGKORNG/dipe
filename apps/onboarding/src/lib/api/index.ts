import { default as httpInstance } from "@repo/http"

export const http = httpInstance.create({
  baseUrl: "http://localhost:3000/api",
})
