import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { deleteTodo, getTodo, updateTodo } from "@/lib/todos";
import { todoUpdateSchema } from "@/lib/validation";

function parseId(id: string) {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const todo = await getTodo(id);
  if (!todo) {
    return NextResponse.json({ message: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ todo });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = todoUpdateSchema.parse(body);
    const existing = await getTodo(id);
    if (!existing) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    const todo = await updateTodo(id, parsed);
    return NextResponse.json({ todo });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    console.error(`Failed to update todo ${id}`, error);
    return NextResponse.json({ message: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const existing = await getTodo(id);
    if (!existing) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    await deleteTodo(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete todo ${id}`, error);
    return NextResponse.json({ message: "Failed to delete todo" }, { status: 500 });
  }
}
