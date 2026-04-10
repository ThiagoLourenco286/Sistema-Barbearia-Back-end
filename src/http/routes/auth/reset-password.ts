import { hash } from "bcryptjs"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../../../lib/prisma"
import { BadRequestError } from "../../_error/badrequest-error"


export function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/password/reset",
    {
      schema: {
        tags: ["Auth"],
        summary: "Reset a password.",
        body: z.object({
          code: z.string(),
          password: z.string().min(6),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { code, password } = request.body

      const codeFromToken = await prisma.token.findFirst({
        where: {
          id: code,
        },
      })

      if (!codeFromToken) {
        throw new BadRequestError("Token invalid.")
      }

      const passwordHash = await hash(password, 6)

      await prisma.$transaction([
        prisma.user.update({
            where: {
                id: codeFromToken.userId
            },
            data: {
                passwordHash
            }
        }),
        prisma.token.delete({
            where: {
                id: code
            }
        })
      ])

      return reply.status(204).send(null)
    },
  )
}
