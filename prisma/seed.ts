import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const todoCount = await prisma.todo.count();
  if (todoCount > 0) {
    return;
  }

  await prisma.todo.createMany({
    data: [
      { title: "Plan project tasks", completed: false },
      { title: "Write first todo", completed: true },
      { title: "Ship the Docker setup", completed: false },
    ],
  });
}

main()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
