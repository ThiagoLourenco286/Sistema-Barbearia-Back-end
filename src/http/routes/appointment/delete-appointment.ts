import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../../_error/badrequest-error";
import { authMiddleware } from "../../middleware/auth";

export function deleteAppointment(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      "/appointments/delete/:appointmentId",
      {
        schema: {
          tags: ["Appointments"],
          summary: "Delete a new appointment",
          security: [{ bearerAuth: [] }],
          params: z.object({
            appointmentId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { appointmentId } = request.params;

        const appointmentExists = await prisma.appointment.findUnique({
          where: {
            id: appointmentId,
          },
        });

        if (!appointmentExists) {
          throw new BadRequestError("Not exists with service.");
        }

        await prisma.appointment.delete({
          where: {
            id: appointmentId,
          },
        });

        return reply.status(204).send(null);
      },
    );
}
