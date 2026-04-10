import fp  from 'fastify-plugin'

export const authMiddleware = fp(async (app) => {
    app.addHook("preHandler", async (request, reply) => {
        request.getCurrentUserId = async () => {
            try {
                const {sub} = await request.jwtVerify<{sub: string}>();
                return sub
            } catch (_) {
                reply.code(401).send({ message: "Token inválido" });
                throw new Error("Unauthorized");
            }
        }
    })
})