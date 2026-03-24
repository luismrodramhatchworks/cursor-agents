import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createTodo, listTodos } from "@/lib/todos";

export const dynamic = "force-dynamic";

export async function GET() {
  const todos = await listTodos();
  return NextResponse.json({ todos });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const todo = await createTodo(body);
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    console.error("Failed to create todo", error);
    return NextResponse.json({ message: "Failed to create todo" }, { status: 500 });
  }
}
