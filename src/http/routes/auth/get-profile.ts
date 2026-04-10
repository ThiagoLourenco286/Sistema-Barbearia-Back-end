import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../../../lib/prisma"
import { BadRequestError } from "../../_error/badrequest-error"
import { authMiddleware } from "../../middleware/auth"

export function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/profile",
      {
        schema: {
          tags: ["Auth"],
          summary: "Get profile user",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                matricula: z.string().max(9),
                avatar: z.string().nullable(),
                role: z.string(),
                equipes: z.array(
                  z.object({
                    functionsRole: z.string(),
                    avaliaçao: z.number(),
                    status: z.string(),
                  }),
                ),
                createdAt: z.date()
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            name: true,
            matricula: true,
            avatar: true,
            role: true,
            equipes: {
              select: {
                functionsRole: true,
                avaliaçao: true,
                status: true,
              },
            },
            createdAt: true
          },
        })

        if (!user) {
          throw new BadRequestError("User not found.")
        }

        return reply.send({ user })
      },
    )
}
