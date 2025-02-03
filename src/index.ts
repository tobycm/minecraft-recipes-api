import { Elysia } from "elysia";

import type { DataPaths } from "./models";

const recentlyAccessedKeys = new Set<string>();

const dataPaths: DataPaths = await Bun.file("data/data/dataPaths.json").json();

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

app.get("/:version/:id", ({ params: { id, version }, error }) => {
  const path = dataPaths.pc[version]["recipes"];
  if (!path) {
    error(404, "Not Found");
    return;
  }

  recentlyAccessedKeys.add(id);
  return Bun.file(path).json();
});
