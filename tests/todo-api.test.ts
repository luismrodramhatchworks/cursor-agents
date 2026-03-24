import { GET as listHandler, POST as createHandler } from "@/app/api/todos/route";
import {
  DELETE as deleteHandler,
  GET as getHandler,
  PUT as updateHandler,
} from "@/app/api/todos/[id]/route";

type ApiTodo = {
  id: number;
  title: string;
  completed: boolean;
};

function jsonRequest(method: string, body?: unknown) {
  return new Request("http://localhost/api/todos", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function jsonRequestWithId(id: number, method: string, body?: unknown) {
  return new Request(`http://localhost/api/todos/${id}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function createTodo(title: string) {
  const response = await createHandler(jsonRequest("POST", { title }));
  const payload = (await response.json()) as { todo: ApiTodo };
  return { response, todo: payload.todo };
}

describe("Todo API", () => {
  it("creates and lists todos", async () => {
    const { response: createResponse, todo } = await createTodo("Write an integration test");
    expect(createResponse.status).toBe(201);

    const listResponse = await listHandler();
    expect(listResponse.status).toBe(200);
    const listPayload = (await listResponse.json()) as { todos: ApiTodo[] };

    const exists = listPayload.todos.some((item) => item.id === todo.id && item.title === todo.title);
    expect(exists).toBe(true);
  });

  it("updates and deletes a todo", async () => {
    const { todo } = await createTodo("Ship Dockerfile");

    const updateResponse = await updateHandler(
      jsonRequestWithId(todo.id, "PUT", { completed: true, title: "Ship Dockerfile now" }),
      { params: Promise.resolve({ id: String(todo.id) }) },
    );
    expect(updateResponse.status).toBe(200);
    const updatedPayload = (await updateResponse.json()) as { todo: ApiTodo };
    expect(updatedPayload.todo.completed).toBe(true);
    expect(updatedPayload.todo.title).toBe("Ship Dockerfile now");

    const deleteResponse = await deleteHandler(jsonRequestWithId(todo.id, "DELETE"), {
      params: Promise.resolve({ id: String(todo.id) }),
    });
    expect(deleteResponse.status).toBe(200);

    const getResponse = await getHandler(jsonRequestWithId(todo.id, "GET"), {
      params: Promise.resolve({ id: String(todo.id) }),
    });
    expect(getResponse.status).toBe(404);
  });
});
