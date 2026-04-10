import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { authMiddleware } from "../../middleware/auth";

export async function getEquipe(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(authMiddleware).get(
    "/equipe",
    {
      schema: {
        tags: ["Equipe"],
        summary: "Show all members of the barbershop.",
        security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              equipes: z.array(
                z.object({
                  id: z.string(),
                  barber: z.object({
                    id: z.string(),
                    name: z.string(),
                    avatar: z.string().nullable(),
                  }),
                  avaliaçao: z.number(),
                  status: z.string(),
                  functionsRole: z.string()
                }),
              ),
            }),
          },
      },
    },
    // biome-ignore lint/correctness/noUnusedFunctionParameters: <>
    async (request) => {
      const equipes = await prisma.equipe.findMany({
        select: {
          id: true,
          barber: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          avaliaçao: true,
          status: true,
          functionsRole: true
        },
        
      });

      return {equipes}
    },
  );
}
