import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import {
  FunctionsRole,
  PrismaClient,
  Role,
} from "../src/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash("123456", 8);

  const admin = await prisma.user.upsert({
    where: { matricula: "ADMIN001" },
    update: {},
    create: {
      name: "Thiago Lourenço",
      matricula: "ADMIN001",
      passwordHash,
      role: Role.ADMIN,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  const barberUser = await prisma.user.upsert({
    where: { matricula: "BARBER001" },
    update: {},
    create: {
      name: "João Costa",
      matricula: "BARBER001",
      passwordHash,
      role: Role.BARBEIRO,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=barber1",
    },
  });

  const barberUser2 = await prisma.user.upsert({
    where: { matricula: "BARBER002" },
    update: {},
    create: {
      name: "Thiago Lourenço",
      matricula: "BARBER002",
      passwordHash,
      role: Role.BARBEIRO,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=barber2",
    },
  });

  const barberUser3 = await prisma.user.upsert({
    where: { matricula: "BARBER003" },
    update: {},
    create: {
      name: "Junior Bar",
      matricula: "BARBER003",
      passwordHash,
      role: Role.BARBEIRO,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=barber3",
    },
  });

  await prisma.user.upsert({
    where: { matricula: "RECEP001" },
    update: {},
    create: {
      name: "Maria Recepção",
      matricula: "RECEP001",
      passwordHash,
      role: Role.RECEPÇÃO,
      avatar: null,
    },
  });

  /*
  =========================
  EQUIPE
  =========================
  ⚠️ barberId precisa ser @unique no schema
  */

 const equipe = await Promise.all([
  prisma.equipe.create({
    data: {
      functionsRole: FunctionsRole.MASTER_BARBER,
      avaliaçao: 4.9,
      status: "DISPONIVEL",
      barberId: barberUser.id,
    },
  }),
  prisma.equipe.create({
    data: {
      functionsRole: FunctionsRole.BARBER_JR,
      avaliaçao: 5,
      status: "EM_ATENDIMENTO",
      barberId: barberUser2.id,
    },
  }),
  prisma.equipe.create({
    data: {
      functionsRole: FunctionsRole.VISAGISTA,
        avaliaçao: 4.8,
        status: "FOLGA",
        barberId: barberUser3.id,
    },
  }),
]);

   const corte = await prisma.service.create({
    data: {
      title: "Corte Masculino",
      service: "Corte",
      description: "Corte tradicional masculino",
      price: 40,
      minute: 30,
      userId: admin.id,
    },
  });

  const barba = await prisma.service.create({
    data: {
      title: "Barba",
      service: "Barba",
      description: "Modelagem completa de barba",
      price: 30,
      minute: 20,
      userId: admin.id,
    },
  });

  const combo = await prisma.service.create({
    data: {
      title: "Combo Urban",
      service: "Corte + Barba",
      description: "Corte + Barba",
      price: 65,
      minute: 50,
      userId: admin.id,
    },
  });

  const today = new Date();

  const createDate = (hour: number, minute: number) =>
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      minute
    );

  await prisma.appointment.createMany({
    data: [
      // 🌅 MANHÃ
      {
        clientName: "João Silva",
        phone: "31999990001",
        description: "Corte degradê",
        scheduleAt: createDate(9, 0),
        barberId: barberUser.id,
        serviceId: corte.id,
      },
      {
        clientName: "Pedro Souza",
        phone: "31999990002",
        description: "Corte + barba",
        scheduleAt: createDate(10, 30),
        barberId: barberUser2.id,
        serviceId: combo.id,
      },

      // ☀️ TARDE
      {
        clientName: "Marcos Lima",
        phone: "31999990003",
        description: "Barba simples",
        scheduleAt: createDate(13, 0),
        barberId: barberUser3.id,
        serviceId: barba.id,
      },
      {
        clientName: "Rafael Alves",
        phone: "31999990004",
        description: "Corte social",
        scheduleAt: createDate(15, 0),
        barberId: barberUser2.id,
        serviceId: corte.id,
      },

      // 🌙 NOITE
      {
        clientName: "Bruno Costa",
        phone: "31999990005",
        description: "Combo premium",
        scheduleAt: createDate(19, 0),
        barberId: barberUser3.id,
        serviceId: combo.id,
      },
      {
        clientName: "Gabriel Rocha",
        phone: "31999990006",
        description: "Corte rápido",
        scheduleAt: createDate(20, 30),
        barberId: barberUser.id,
        serviceId: corte.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed executado com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });