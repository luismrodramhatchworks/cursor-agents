import { execSync } from "node:child_process";

import prisma from "@/lib/prisma";

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set for tests");
  }

  try {
    execSync("npx prisma migrate deploy", { stdio: "ignore" });
  } catch (error) {
    console.error("Failed to run migrations before tests", error);
    throw error;
  }

  await prisma.todo.deleteMany();
});

afterEach(async () => {
  await prisma.todo.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
