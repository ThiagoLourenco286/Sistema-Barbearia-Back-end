import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import z from "zod";
import { prisma } from "../../../lib/prisma";

export function recoverPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/recover",
    {
      schema: {
        tags: ["Auth"],
        summary: "Recover password.",
        body: z.object({
          matricula: z.string().max(9),
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
          500: z.string()
        },
      },
    },
   async (request, reply) => {
  try {
    const { matricula, email } = request.body;

    const matriculaExist = await prisma.user.findUnique({
      where: { matricula },
    });

    if (!matriculaExist) {
      return reply.status(201).send(null);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()

     await prisma.token.create({
      data: {
        id: code,
        type: "PASSWORD_RECOVER",
        userId: matriculaExist.id,
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.mailersend.net",
      port: 587,
      secure: false,
      auth: {
        user: "MS_NWdYCp@test-3m5jgroevnmgdpyo.mlsender.net",
        pass: "mssp.INcuorx.v69oxl5nzj2l785k.DFopU3F"
      },
    });

    await transporter.sendMail({
      from: "UrbanCut <noreply@test-3m5jgroevnmgdpyo.mlsender.net>",
      to: email,
      subject: "Recuperação de senha",
      text: `Seu código é: ${code}`,
      html: `<b>Seu código é: ${code}</b>`,
    });

    return reply.status(201).send(null);

  } catch (error) {
    console.error(error);
    return reply.status(500).send("Erro servidor");
  }
}
  );
}
