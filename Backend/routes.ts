import { Router } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import {
  getTodos,
  getSingleTodo,
  addTodo,
  updateTodo,
  deleteTodo,
} from "./controllers/tasks.ts";

const router = new Router();

router.get("/API/tasks", getTodos)
  .get("/API/tasks/:id", getSingleTodo)
  .post("/API/tasks", addTodo)
  .put("/API/tasks/:id", updateTodo)
  .delete("/API/tasks/:id", deleteTodo);

export default router;
