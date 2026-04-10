import { hash } from "bcryptjs"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../../../lib/prisma"
import { BadRequestError } from "../../_error/badrequest-error"

export function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/session/create",
    {
      schema: {
        tags: ["Auth"],
        summary: "Create a new user",
        body: z.object({
          name: z.string(),
          matricula: z.string().max(9),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { matricula, name, password } = await request.body

      const matriculaExist = await prisma.user.findUnique({
        where: {
          matricula,
        },
      })

      if (matriculaExist) {
        throw new BadRequestError("Registration already exists.")
      }

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          matricula,
          passwordHash,
          role: "RECEPÇÃO",
        },
      })

      return reply.status(200).send()
    },
  )
}
