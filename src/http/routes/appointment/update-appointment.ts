import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { calculatePeriod } from "../../../utils/appointments";
import { BadRequestError } from "../../_error/badrequest-error";
import { authMiddleware } from "../../middleware/auth";

export async function updateAppointment(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .put(
      "/appointments/update/:appointmentId",
      {
        schema: {
          tags: ["Appointments"],
          summary: "Update in appointment",
          security: [{ bearerAuth: [""] }],
          params: z.object({
            appointmentId: z.string(),
          }),
          body: z.object({
            clientName: z.string(),
            phone: z.string(),
            description: z.string(),
            scheduleAt: z.coerce.date(),
            barberId: z.string(),
            serviceId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { appointmentId } = await request.params;

        const appointmentExists = await prisma.appointment.findUnique({
          where: {
            id: appointmentId,
          },
        });

        if (!appointmentExists) {
          throw new BadRequestError("Não existe esse agendamento.");
        }

        const {
          clientName,
          phone,
          description,
          scheduleAt,
          barberId,
          serviceId,
        } = await request.body;

        const hour = scheduleAt.getHours();

        const { isAfternoon, isEvening, isMorning } =
          await calculatePeriod(hour);

        if (!isMorning && !isAfternoon && !isEvening) {
          throw new BadRequestError(
            '"Agendamentos só podem ser feitos entre 9h e 12h, 13h e 18 ou 19h e 21h",',
          );
        }

        const appointmentDateExists = await prisma.appointment.findFirst({
          where: {
            scheduleAt,
            NOT: {
              id: appointmentId,
            },
          },
        });

        if (appointmentDateExists) {
          throw new BadRequestError("Esse horario ja esta agendado.");
        }

        await prisma.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            clientName,
            phone,
            description,
            scheduleAt,
            barberId,
            serviceId,
          },
        });

        return reply.status(204).send(null);
      },
    );
}
