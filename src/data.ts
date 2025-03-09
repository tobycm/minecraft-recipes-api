import {
  DataPaths,
  Item,
  RawRecipe,
  RawRecipeItem,
  RawRecipeRow,
  RawResultWithCount,
  RawShapelessRecipe,
  Recipe,
  RecipeItem,
  RecipeRow,
  ShapelessRecipe,
} from "./models";

const rootDataPath = "data/data";

const dataPaths: DataPaths = await Bun.file(`${rootDataPath}/dataPaths.json`).json();

interface Items {
  [id: string]: Item;
}

export const items: { [version: string]: Items } = {};

for (const version in dataPaths.pc) {
  const itemsFile = dataPaths.pc[version]["items"];
  if (!itemsFile) {
    console.error(`Items not found for PC version ${version}`);
    continue;
  }

  items[version] = {};

  const loadedItems = await Bun.file(`${rootDataPath}/${itemsFile}/items.json`).json();
  for (const item of loadedItems) {
    items[version][item.id] = item;
  }
}

function rawItemToItem(item: RawRecipeItem, items: Items): RecipeItem {
  if (typeof item === "number") return { item: items[item] };
  if (Array.isArray(item)) return { item: items[item[0]], metadata: item[1] };
  return { item: items[item.id], metadata: item.metadata };
}

function rawRowtoItem(row: RawRecipeRow, items: Items): RecipeRow {
  return row.map((item) => {
    if (item === null) return null;
    return rawItemToItem(item, items);
  });
}

function rawIngredientToItem(ingredient: RawShapelessRecipe["ingredients"], items: Items): ShapelessRecipe["ingredients"] {
  return ingredient.map((item) => rawItemToItem(item, items));
}

export const recipes: {
  [version: string]: { [name: string]: Recipe[] };
} = {};

for (const version in dataPaths.pc) {
  const recipesFile = dataPaths.pc[version]["recipes"];
  if (!recipesFile) {
    console.error(`Recipes not found for PC version ${version}`);
    continue;
  }

  recipes[version] = {};

  const recipesData: { [id: string]: RawRecipe[] } = await Bun.file(`${rootDataPath}/${recipesFile}/recipes.json`).json();

  for (const [id, itemRecipes] of Object.entries(recipesData)) {
    if (!items[version][id]) continue;

    for (const rawRecipe of itemRecipes) {
      if (!(items[version][id].name in recipes[version])) {
        recipes[version][items[version][id].name] = [];
      }

      try {
        recipes[version][items[version][id].name].push({
          ...("ingredients" in rawRecipe
            ? { ingredients: rawIngredientToItem(rawRecipe.ingredients, items[version]) }
            : {
                inShape: rawRecipe.inShape.map((row) => rawRowtoItem(row, items[version])),
                outShape: rawRecipe.outShape?.map((row) => rawRowtoItem(row, items[version])),
              }),
          result: {
            ...rawItemToItem(rawRecipe.result, items[version]),
            ...(typeof rawRecipe == "object" && "count" in (rawRecipe.result as RawResultWithCount)
              ? { count: (rawRecipe.result as RawResultWithCount).count }
              : {}),
          },
        });
      } catch (error) {}
    }
  }
}
