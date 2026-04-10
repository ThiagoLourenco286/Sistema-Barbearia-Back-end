import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../../../lib/prisma"
import { BadRequestError } from "../../_error/badrequest-error"
import { authMiddleware } from "../../middleware/auth"

export function createService(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/services/create-services",
      {
        schema: {
          tags: ["Services"],
          summary: "Create a new services",
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string().max(20),
            service: z.string(),
            description: z.string(),
            price: z.number().int(),
            minute: z.number().int(),
          }),
          response: {
            201: z.object({
              serviceId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { title, service, price, description, minute } = request.body

        const serviceExist = await prisma.service.findFirst({
          where: {
            service,
          },
        })

        if (serviceExist) {
          throw new BadRequestError("The service already exists.")
        }

        const services = await prisma.service.create({
          data: {
            title,
            service,
            price,
            description,
            minute,
          },
        })

        return reply.status(201).send({
          serviceId: services.id,
        })
      },
    )
}
