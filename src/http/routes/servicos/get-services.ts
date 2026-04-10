import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../../../lib/prisma"

export function getServices(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/services",
      {
        schema: {
          tags: ["Services"],
          summary: "Get Details services",
          response: {
            200: z.object({
              services: z.array(
                z.object({
                  id: z.string(),
                  title: z.string().max(20),
                  service: z.string(),
                  description: z.string(),
                  price: z.number(),
                  minute: z.number(),
                }),
              ),
            }),
          },
        },
      },
      // biome-ignore lint/correctness/noUnusedFunctionParameters: <>
      async (request) => {

        const services = await prisma.service.findMany({
          select: {
            id: true,
            title: true,
            service: true,
            description: true,
            price: true,
            minute: true,
          },
          orderBy: {
            title: 'asc'
          }
        })

        return { services }
      },
    )
}
