import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../../_error/badrequest-error";
import { authMiddleware } from "../../middleware/auth";

export function deleteService(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      "/services/delete/:serviceId",
      {
        schema: {
          tags: ["Services"],
          summary: "Delete services",
          security: [{ bearerAuth: [] }],
          params: z.object({
            serviceId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { serviceId } = request.params;

        const serviceIdExists = await prisma.service.findUnique({
          where: {
            id: serviceId,
          },
        });

        if (!serviceIdExists) {
          throw new BadRequestError("Not exists with service.");
        }

        await prisma.service.delete({
          where: {
            id: serviceId,
          },
        });

        return reply.status(204).send(null);
      },
    );
}
