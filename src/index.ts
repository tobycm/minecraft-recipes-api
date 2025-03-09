import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { addRecipe, deleteRecipeByName, getRecipeById, getRecipeByName, updateRecipeByName } from "./custom";
import { recipes } from "./data";
import { Recipe, TRecipe, TUserRecipe } from "./models";

const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello Elysia")
  .get(
    "/all",
    ({ set }) => {
      set.headers["cache-control"] = `public, max-age=${60 * 60 * 2}`;
      return recipes;
    },
    {
      response: {
        200: t.Record(t.String({ title: "version" }), t.Record(t.String({ title: "name" }), t.Array(TRecipe))),
      },
    }
  )
  .get(
    "/versions",
    ({ set }) => {
      set.headers["cache-control"] = `public, max-age=${60 * 60 * 2}`;
      return Object.keys(recipes);
    },
    {
      response: {
        200: t.Array(t.String({ title: "version" })),
      },
    }
  )
  .get(
    "/:version",
    ({ params: { version }, query: { onlyName }, set, error }) => {
      set.headers["cache-control"] = `public, max-age=${60 * 60 * 2}`;

      if (!recipes[version]) return error(404, "Version not found");
      if (onlyName) return Object.keys(recipes[version]);
      return recipes[version];
    },
    {
      params: t.Object({
        version: t.String(),
      }),
      query: t.Object({
        onlyName: t.Boolean({ default: true }),
      }),
      response: {
        200: t.Union([t.Record(t.String({ title: "name" }), t.Array(t.Object({}, { title: "recipe" }))), t.Array(t.String({ title: "name" }))]),
        404: t.Literal("Version not found"),
      },
    }
  )
  .get(
    "/:version/:name",
    // @ts-ignore
    ({ params: { version, name }, query: { simple }, set, error }) => {
      set.headers["cache-control"] = `public, max-age=${60 * 60 * 2}`;

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
                result: {
                  item: r.result.item.name,
                  count: r.result.count,
                },
              }
            : {
                inShape: r.inShape.map((row) => row.map((i) => i?.item.name)),
                outShape: r.outShape?.map((row) => row.map((i) => i?.item.name)),
                result: {
                  item: r.result.item.name,
                  count: r.result.count,
                },
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
      response: {
        200: t.Union([
          t.Array(
            t.Union([
              t.Object(
                {
                  ingredients: t.Array(t.String({ title: "item" })),
                  result: t.Object({
                    item: t.String({ title: "item" }),
                    count: t.Optional(t.Number({ title: "count" })),
                  }),
                },
                { title: "recipe" }
              ),
              t.Object(
                {
                  inShape: t.Array(t.Array(t.Optional(t.String({ title: "item_name" })))),
                  outShape: t.Optional(t.Array(t.Array(t.Optional(t.String({ title: "item_name" }))))),
                  result: t.Object({
                    item: t.String({ title: "item_name" }),
                    count: t.Optional(t.Number({ title: "count" })),
                  }),
                },
                { title: "recipe" }
              ),
            ]),
            { title: "simple" }
          ),
          t.Array(TRecipe),
        ]),
        404: t.Literal("Recipe not found"),
      },
    }
  )
  // .get(
  //   "/render/:version/:name",
  //   function* ({ params: { version, name }, query: { simple }, error }) {
  //     let recipe: Recipe[];
  //     try {
  //       recipe = recipes[version][name];
  //     } catch (e) {
  //       return error(404, "Recipe not found");
  //     }
  //     if (!recipe) return error(404, "Recipe not found");

  //     for (const craft of recipe) {
  //       if ("ingredients" in craft) {
  //         yield ``;
  //       }
  //     }
  //   },
  //   {
  //     params: t.Object({
  //       version: t.String(),
  //       name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z_]+$" }),
  //     }),
  //     query: t.Object({
  //       simple: t.Boolean({ default: true }),
  //     }),
  //   }
  // )
  .get(
    "/custom/:idOrName",
    ({ params: { idOrName }, error }) => {
      const dbRecipe = isNaN(Number(idOrName)) ? getRecipeByName(idOrName) : getRecipeById(Number(idOrName));

      if (!dbRecipe) return error(404, "Recipe not found");

      return {
        id: dbRecipe.id,
        name: dbRecipe.name,
        recipe: JSON.parse(dbRecipe.recipe),
        created: dbRecipe.created,
        modified: dbRecipe.modified,
      };
    },
    {
      params: t.Object({
        idOrName: t.String({ minLength: 1, maxLength: 100, pattern: "^(?:[a-z_]+|d+)$" }),
      }),
      response: {
        200: t.Object(
          {
            id: t.Number(),
            name: t.String(),
            recipe: TUserRecipe,
            created: t.String(),
            modified: t.String(),
          },
          { title: "Recipe" }
        ),
        404: t.Literal("Recipe not found"),
      },
    }
  )
  .post(
    "/custom/:name",

    ({ params: { name }, body: { recipe }, error }) => {
      if (!recipe) return error(400, "Recipe is required");

      const dbRecipe = getRecipeByName(name);

      if (dbRecipe) return error(400, "Recipe already exists");

      const key = addRecipe(name, JSON.stringify(recipe));

      return { key };
    },
    {
      params: t.Object({
        name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z_]+$" }),
      }),
      body: TUserRecipe,
      response: {
        200: t.Object({
          key: t.String(),
        }),
        400: t.Union([t.Literal("Recipe is required"), t.Literal("Recipe already exists")]),
      },
    }
  )
  .put(
    "/custom/:name",
    ({ params: { name }, query: { key }, body: { recipe }, error }) => {
      if (!recipe) return error(400, "Recipe is required");
      if (!key) return error(400, "Update key is required");

      const dbRecipe = getRecipeByName(name);
      if (!dbRecipe) return error(404, "Recipe not found");

      if (dbRecipe.adminKey !== key) return error(403, "Invalid key");

      updateRecipeByName(name, JSON.stringify(recipe));

      return { success: true };
    },
    {
      params: t.Object({
        name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z_]+$" }),
      }),
      query: t.Object({
        key: t.String(),
      }),
      body: TUserRecipe,
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
        400: t.Union([t.Literal("Recipe is required"), t.Literal("Update key is required")]),
        404: t.Literal("Recipe not found"),
        403: t.Literal("Invalid key"),
      },
    }
  )
  .delete(
    "/custom/:name",
    ({ params: { name }, query: { key }, error }) => {
      if (!key) return error(400, "Delete key is required");

      const dbRecipe = getRecipeByName(name);
      if (!dbRecipe) return error(404, "Recipe not found");

      if (dbRecipe.adminKey !== key) return error(403, "Invalid key");

      deleteRecipeByName(name);

      return { success: true };
    },
    {
      params: t.Object({
        version: t.String(),
        name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z_]+$" }),
      }),
      query: t.Object({
        key: t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
        400: t.Literal("Delete key is required"),
        404: t.Literal("Recipe not found"),
        403: t.Literal("Invalid key"),
      },
    }
  )
  .listen(3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
