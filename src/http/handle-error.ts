import type { FastifyInstance } from "fastify"
import { ZodError } from "zod"
import { BadRequestError } from "./_error/badrequest-error"
import { UnauthorizedError } from "./_error/unauthorized-error"

type FastifyErrorHandle = FastifyInstance["errorHandler"]

// biome-ignore lint/correctness/noUnusedFunctionParameters: <request error>
export const errorHandle: FastifyErrorHandle = (error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: "Erro na Validação",
      error: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    reply.status(400).send({
      message: error.message,
    })
  }

  reply.status(500).send({ message: "Erro interno no servidor." })
}
