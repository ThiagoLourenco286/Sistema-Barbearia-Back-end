import fastifyCors from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"
import fastifySwagger from "@fastify/swagger"
import { fastifySwaggerUi } from "@fastify/swagger-ui"
import fastify from "fastify"
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"
import { errorHandle } from "./handle-error"
import { createAppointment } from "./routes/appointment/create-appointment"
import { deleteAppointment } from "./routes/appointment/delete-appointment"
import { getAppointment } from "./routes/appointment/get-appointment"
import { updateAppointment } from "./routes/appointment/update-appointment"
import { authenticateWithMatriculaAndPassword } from "./routes/auth/authenticate-with-matricula-and-password"
import { createAccount } from "./routes/auth/create-account"
import { getProfile } from "./routes/auth/get-profile"
import { recoverPassword } from "./routes/auth/recover-password"
import { resetPassword } from "./routes/auth/reset-password"
import { getEquipe } from "./routes/equipe/get-equipe"
import { getOverview } from "./routes/overwiew/get-overwiew"
import { createService } from "./routes/servicos/create-service"
import { deleteService } from "./routes/servicos/delete-service"
import { getServices } from "./routes/servicos/get-services"
import { updateService } from "./routes/servicos/update-service"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandle)

app.register(fastifyCors)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "UrbanCut",
      description: "Sistama para barbearia",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
})

app.register(fastifyJwt, {
  secret: "jwt-secret",
})

app.register(getOverview)

app.register(authenticateWithMatriculaAndPassword)
app.register(createAccount)
app.register(recoverPassword)
app.register(resetPassword)
app.register(getProfile)

app.register(getServices)
app.register(createService)
app.register(deleteService)
app.register(updateService)

app.register(getEquipe)

app.register(getAppointment)
app.register(createAppointment)
app.register(deleteAppointment)
app.register(updateAppointment)

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!")
})
