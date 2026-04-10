import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../../../lib/prisma"
import { UnauthorizedError } from "../../_error/unauthorized-error"
import { authMiddleware } from "../../middleware/auth"

export async function getOverview(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/",
      {
        schema: {
          tags: ["Overview"],
          summary: "Get overview",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              status: z.object({
                emAtendimento: z.number(),
                disponivel: z.number(),
                folga: z.number(),
                ausente: z.number(),
              }),
              corteMes: z.number(),
              rankingBarber: z.array(
                z.object({
                  id: z.string(),
                  barber: z.object({
                    name: z.string()
                  }),
                  avaliaçao: z.number(),
                  barberId: z.string(),
                }),
              ),
              totalBarber: z.number(),
              faturamentoMensal: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (user?.role !== "ADMIN") {
          throw new UnauthorizedError("Sem permissão.")
        }

        const now = new Date()
        const inicialMes = new Date(now.getFullYear(), now.getMonth(), 1)
        const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        const [
          totalBarber,
          emAtendimento,
          disponivel,
          folga,
          ausente,
          rankingBarber,
          appointments,
          corteMes,
        ] = await Promise.all([
          prisma.equipe.count(),

          prisma.equipe.count({
            where: { status: "EM_ATENDIMENTO" },
          }),

          prisma.equipe.count({
            where: { status: "DISPONIVEL" },
          }),

          prisma.equipe.count({
            where: { status: "FOLGA" },
          }),

          prisma.equipe.count({
            where: { status: "AUSENTE" },
          }),

          prisma.equipe.findMany({
            include: {
                barber: {
                    select: {
                        name: true
                    }
                }
            },
            take: 5,
            orderBy: {
              avaliaçao: "desc", // melhor primeiro 👀
            },
          }),

          prisma.appointment.findMany({
            where: {
              scheduleAt: {
                gte: inicialMes,
                lt: fimMes,
              },
            },
            include: {
              service: true,
            },
          }),

          prisma.appointment.count({
            where: {
              scheduleAt: {
                gte: inicialMes,
                lt: fimMes,
              },
            },
          }),
        ])

        const faturamentoMensal = appointments.reduce((acc, item) => {
          return acc + item.service.price
        }, 0)

        return reply.send({
          status: {
            emAtendimento,
            disponivel,
            folga,
            ausente,
          },
          corteMes,
          rankingBarber,
          totalBarber,
          faturamentoMensal,
        })
      },
    )
}
