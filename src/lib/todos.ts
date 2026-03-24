import prisma from "@/lib/prisma";
import {
  TodoCreateInput,
  TodoUpdateInput,
  todoCreateSchema,
  todoUpdateSchema,
} from "@/lib/validation";

export async function listTodos() {
  return prisma.todo.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function getTodo(id: number) {
  return prisma.todo.findUnique({ where: { id } });
}

export async function createTodo(payload: TodoCreateInput) {
  const data = todoCreateSchema.parse(payload);
  return prisma.todo.create({ data });
}

export async function updateTodo(id: number, payload: TodoUpdateInput) {
  const data = todoUpdateSchema.parse(payload);
  return prisma.todo.update({ where: { id }, data });
}

export async function deleteTodo(id: number) {
  return prisma.todo.delete({ where: { id } });
}
