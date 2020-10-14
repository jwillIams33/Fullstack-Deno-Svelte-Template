import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { Todo } from "../types.ts";
import {
  RouterContext,
  HttpError,
  Status,
} from "https:deno.land/x/oak@v6.3.1/mod.ts";

import { Task } from "../models/task.ts";

type RContext = RouterContext<
  Record<string | number, string | undefined>,
  Record<string, any>
>;

let todos: Todo[] = [];

// Get all Todos @route GET /API/tasks
const getTodos = async (ctx: RContext) => {
  try {
    todos = await Task.findAll();
    ctx.response.body = {
      todos,
    };
  } catch (err) {
    const error = new HttpError();
    error.status = Status.NotFound;
    throw error;
  }
};

// Get a single Task @route GET /API/tasks/:id
const getSingleTodo = async (ctx: RContext) => {
  try {
    const id = ctx.params.id!;
    const todo = await Task.findById(id);
    if (!todo) {
      const error = new HttpError();
      error.status = Status.NotFound;
      throw error;
    }

    ctx.response.body = {
      todo,
    };
  } catch (err) {
    const error = new HttpError();
    error.status = Status.NotFound;
    throw error;
  }
};

// Add A Task @route POST /API/tasks
const addTodo = async (ctx: RContext) => {
  const body = await ctx.request.body();

  // This clause fixes a known bug in Oak. 
  if (body.type === "json") {
    const value = await body.value;
  }

  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      msg: "No Data",
    };
  } else {
    const todo: Todo = await body.value;
    todo.id = v4.generate();
    todos.push(todo);
    await Task.create(todo);
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      data: todo,
    };
  }
};


// Update A Task @route PUT /API/tasks/:id
const updateTodo = async (ctx: RContext) => {
  todos = await Task.findAll();
  const todo = todos.find((todo) => todo._id.$oid === ctx.params.id);
  if (todo) {
    const body = await ctx.request.body();

    // This clause fixes a known bug in Oak. 
    if (body.type === "json") {
      const value = await body.value;
    }

    const id = ctx.params.id!;
    const updateData =  await body.value;
    const checked = updateData.name.checked
    console.log(updateData);

    todos = todos.map((todo) =>
      todo.id === ctx.params.id ? { ...todo, ...checked } : todo
    );

    try {
      await Task.update(id, updateData);
    } catch (err) {
      const error = new HttpError();
      error.status = Status.NotFound;
      throw error;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      data: todos,
    };
  } else {
    ctx.response.status = 404;
    ctx.response.body = {
      success: false,
      msg: "No task Found",
    };
  }
};

// Delete A task @route DELETE /API/tasks/:id
const deleteTodo = async (ctx: RContext) => {
  const id = ctx.params.id!;
  todos = todos.filter((p) => p.id !== ctx.params.id);
  try {
    await Task.delete(id);
  } catch (err) {
    const error = new HttpError();
    error.status = Status.NotFound;
    throw error;
  }
  ctx.response.body = {
    success: true,
    msg: "Task Removed",
  };
};

export { getTodos, getSingleTodo, addTodo, updateTodo, deleteTodo };
