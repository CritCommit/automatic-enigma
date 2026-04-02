const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const bossPassword = await bcrypt.hash("boss123", 10);
  const boss = await prisma.user.upsert({
    where: { email: "boss@example.com" },
    update: {},
    create: {
      email: "boss@example.com",
      name: "The Boss",
      password: bossPassword,
      role: "BOSS",
    },
  });

  const employeePassword = await bcrypt.hash("employee123", 10);
  const employee = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: {},
    create: {
      email: "employee@example.com",
      name: "The Employee",
      password: employeePassword,
      role: "EMPLOYEE",
    },
  });

  const project1 = await prisma.project.upsert({
    where: { id: "proj-1" },
    update: {},
    create: {
      id: "proj-1",
      name: "Website Redesign",
      description: "Overhauling the main corporate website.",
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: "proj-2" },
    update: {},
    create: {
      id: "proj-2",
      name: "Mobile App Development",
      description: "Creating a new mobile app for iOS and Android.",
    },
  });

  console.log({ boss, employee, project1, project2 });
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
