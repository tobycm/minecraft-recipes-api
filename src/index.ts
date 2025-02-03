import { Elysia, t } from "elysia";
import { recipes } from "./data";
import { Recipe } from "./models";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get(
    "/:version/:name",
    ({ params: { version, name }, query: { simple }, error }) => {
      let recipe: Recipe[];
      try {
        recipe = recipes[version][name];
      } catch (e) {
        return error(404, "Recipe not found");
      }
      if (!recipe) return error(404, "Recipe not found");

      if (simple) {
        return recipe.map((r) =>
          "ingredients" in r
            ? {
                ingredients: r.ingredients.map((i) => i.item.name),
                result: r.result.item.name,
              }
            : {
                inShape: r.inShape.map((row) => row.map((i) => i?.item.name)),
                outShape: r.outShape?.map((row) => row.map((i) => i?.item.name)),
                result: r.result.item.name,
              }
        );
      }

      return recipe;
    },
    {
      params: t.Object({
        version: t.String(),
        name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z_]+$" }),
      }),
      query: t.Object({
        simple: t.Boolean({ default: true }),
      }),
    }
  )
  .get(
    "/render/:version/:name",
    ({ params: { version, name }, query: { simple }, error }) => {
      let recipe: Recipe[];
      try {
        recipe = recipes[version][name];
      } catch (e) {
        return error(404, "Recipe not found");
      }
      if (!recipe) return error(404, "Recipe not found");

      const strings: string[] = [];

      recipe.forEach((r) => {
        if ("ingredients" in r) return strings.push(...r.ingredients.map((i) => (simple ? i.item.name : i.item.displayName)));

        r.inShape.forEach((row) => strings.push(...row.map((i) => (i ? (simple ? i.item.name : i.item.displayName) : " "))));
      });

      const longest = strings.reduce((a, b) => (a.length > b.length ? a : b)).length;

      return recipe;
    },
    {
      params: t.Object({
        version: t.String(),
        name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z_]+$" }),
      }),
      query: t.Object({
        simple: t.Boolean({ default: true }),
      }),
    }
  )
  .post(
    "/custom/:version/:name",

    // TODO: read copilot's code
    ({ params: { version, name }, body: { recipe }, error }) => {
      if (!recipe) return error(400, "Recipe is required");

      if (!recipes[version]) recipes[version] = {};

      if (!recipes[version][name]) recipes[version][name] = [];

      recipes[version][name].push(recipe);

      return recipe;
    },
    {
      params: t.Object({
        version: t.String(),
        name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z_]+$" }),
      }),
      body: t.Object({
        recipe: t.Object({
          result: t.Object({
            item: t.String(),
            metadata: t.Number({ default: 0 }),
            count: t.Number({ default: 1 }),
          }),
          inShape: t.Array(
            t.Array(
              t.Object({
                item: t.String(),
                metadata: t.Number({ default: 0 }),
                count: t.Number({ default: 1 }),
              })
            )
          ),
          outShape: t.Array(
            t.Array(
              t.Object({
                item: t.String(),
                metadata: t.Number({ default: 0 }),
                count: t.Number({ default: 1 }),
              })
            )
          ),
        }),
      }),
    }
  )
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
