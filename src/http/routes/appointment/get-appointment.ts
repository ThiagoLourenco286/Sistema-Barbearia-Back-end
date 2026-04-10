import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { authMiddleware } from "../../middleware/auth";

export async function getAppointment(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/appointments",
      {
        schema: {
          tags: ["Appointments"],
          summary: "Get appointments",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              appointments: z.array(
                z.object({
                  id: z.string(),
                  clientName: z.string(),
                  phone: z.string(),
                  description: z.string(),
                  scheduleAt: z.date(),
                  barber: z.object({
                    id: z.string(),
                    barber: z.object({
                      name: z.string(),
                      role: z.string(),
                    }),
                  }),
                  service: z.object({
                    id: z.string(),
                    price: z.number(),
                    title: z.string(),
                    service: z.string(),
                    minute: z.number(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (_) => {
         const now = new Date()
        const inicialMes = new Date(now.getFullYear(), now.getMonth(), 1)
        const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        const appointments = await prisma.appointment.findMany({
          where: {
            scheduleAt: {
              gte: inicialMes,
              lt: fimMes
            }
          },
          select: {
            id: true,
            clientName: true,
            phone: true,
            description: true,
            scheduleAt: true,
            barber: {
              select: {
                id: true,
                barber: {
                  select: {
                    name: true,
                    role: true,
                  },
                },
              },
            },
            service: {
              select: {
                id: true,
                price: true,
                title: true,
                service: true,
                minute: true,
              },
            },
          },
          orderBy: {
            scheduleAt: "asc",
          },
        });

        return { appointments };
      },
    );
}
