import { compare } from "bcryptjs"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../../../lib/prisma"
import { BadRequestError } from "../../_error/badrequest-error"
import { UnauthorizedError } from "../../_error/unauthorized-error"

export function authenticateWithMatriculaAndPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/session/password",
    {
      schema: {
        tags: ["Auth"],
        summary: "User authentication using registration number and password.",
        body: z.object({
          matricula: z.string().max(9),
          password: z.string(),
        }),
        response: {
          201:  z.object({
            token: z.string()
          })
        },
      },
    },
    async (request, reply) => {
      const { matricula, password } = await request.body

      const matriculaExist = await prisma.user.findUnique({
        where: {
          matricula,
        },
      })

      if (!matriculaExist) {
        throw new BadRequestError("Registration number does not exist.")
      }

      if (password === null) {
        throw new UnauthorizedError("The password cannot be empty.")
      }

      const isPasswordValid = await compare(
        password,
        matriculaExist.passwordHash,
      )

      if (!isPasswordValid) {
        throw new UnauthorizedError("The password is invalid.")
      }

      const token = await reply.jwtSign(
        {
          sub: matriculaExist.id,
        },

        {
          sign: {
            expiresIn: "7d",
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
