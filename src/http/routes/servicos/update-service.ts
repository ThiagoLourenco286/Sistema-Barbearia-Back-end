import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../../../lib/prisma"
import { BadRequestError } from "../../_error/badrequest-error"
import { authMiddleware } from "../../middleware/auth"

export function updateService(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(authMiddleware).put(
    "/services/update/:serviceId",
    {
      schema: {
        tags: ["Services"],
        summary: "Delete services",
        security: [{ bearerAuth: [] }],
        params: z.object({
          serviceId: z.string(),
        }),
        body: z.object({
          title: z.string().max(20),
          service: z.string(),
          description: z.string(),
          price: z.number(),
          minute: z.number(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { serviceId } = await request.params

      const serviceIdExists = await prisma.service.findUnique({
        where: {
          id: serviceId,
        },
      })

      if (!serviceIdExists) {
        throw new BadRequestError("Not exists with service.")
      }

      const {title, description, service, minute, price} = await request.body

      await prisma.service.update({
       data: {
            title, 
            description, 
            service,
            minute,
            price
       },
       where: {
        id: serviceId
       }
      })

      return reply.status(204).send(null)
    },
  )
}
