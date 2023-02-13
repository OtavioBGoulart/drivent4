import { ApplicationError } from "@/protocols";

export function forbidden(): ApplicationError {
  return {
    name: "Forbidden",
    message: "Breaks the business rule",
  };
}