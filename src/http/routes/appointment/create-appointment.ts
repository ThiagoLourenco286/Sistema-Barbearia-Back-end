import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { calculatePeriod } from "../../../utils/appointments";
import { BadRequestError } from "../../_error/badrequest-error";
import { authMiddleware } from "../../middleware/auth";

export function createAppointment(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/appointments/create",
      {
        schema: {
          tags: ["Appointments"],
          summary: "Create a new appointment",
          security: [{ bearerAuth: [] }],
          body: z.object({
            clientName: z.string(),
            phone: z.string(),
            description: z.string(),
            scheduleAt: z.coerce.date(),
            barberId: z.string(),
            serviceId: z.string(),
          }),
          response: {
            201: z.object({
              appointmentId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const {
          clientName,
          phone,
          description,
          scheduleAt,
          barberId,
          serviceId,
        } = await request.body;

        const hour = scheduleAt.getHours();

        const { isEvening, isAfternoon, isMorning } = calculatePeriod(hour);

        if (!isMorning && !isAfternoon && !isEvening) {
          throw new BadRequestError(
            '"Agendamentos só podem ser feitos entre 9h e 12h, 13h e 18 ou 19h e 21h",',
          );
        }

        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            scheduleAt,
          },
        });

        if (existingAppointment) {
          throw new BadRequestError(
            'Este horário já está reservado',
          );
        }

        const appointment = await prisma.appointment.create({
          data: {
            clientName,
            phone,
            description,
            scheduleAt,
            barberId,
            serviceId,
          },
        });

        return reply.status(201).send({
          appointmentId: appointment.id,
        });
      },
    );
}
