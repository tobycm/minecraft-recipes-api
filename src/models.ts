import { t } from "elysia";

type FolderPath = string;

export interface DataPaths {
  pc: {
    [version: string]: {
      [category: string]: FolderPath;
    };
  };
  bedrock: {
    [version: string]: {
      [category: string]: FolderPath;
    };
  };
}

type ID = number;
type Metadata = number;

export interface Item {
  id: number;
  name: string;
  displayName: string;
  stackSize: number;
}

export const TItem = t.Object(
  {
    id: t.Number(),
    name: t.String(),
    displayName: t.String(),
    stackSize: t.Number(),
  },
  { title: "Item" }
);

export type RawResultWithCount = { id: ID; metadata?: Metadata; count?: number };

export type RawRecipeItem = ID | [ID, Metadata] | { id: ID; metadata?: Metadata; count?: number };

export type RawRecipeRow = (RawRecipeItem | null)[];

type RawRecipeShape = RawRecipeRow[];

export interface RawShapedRecipe {
  result: RawRecipeItem;
  inShape: RawRecipeShape;
  outShape?: RawRecipeShape;
}

export interface RawShapelessRecipe {
  result: RawRecipeItem;
  ingredients: RawRecipeItem[];
}

export type RawRecipe = RawShapedRecipe | RawShapelessRecipe;

export type RecipeItem = { item: Item; metadata?: number; count?: number }; // id changed to item name

export const TRecipeItem = t.Object(
  {
    item: TItem,
    metadata: t.Optional(t.Number()),
    count: t.Optional(t.Number()),
  },
  { title: "RecipeItem" }
);

export type RecipeRow = (RecipeItem | null)[];

export const TRecipeRow = t.Array(t.Union([TRecipeItem, t.Null()]), { title: "RecipeRow" });

type RecipeShape = RecipeRow[];

export const TRecipeShape = t.Array(TRecipeRow, { title: "RecipeShape" });

export interface ShapedRecipe {
  result: RecipeItem;
  inShape: RecipeShape;
  outShape?: RecipeShape;
}

export const TShapedRecipe = t.Object(
  {
    result: TRecipeItem,
    inShape: TRecipeShape,
    outShape: t.Optional(TRecipeShape),
  },
  { title: "ShapedRecipe" }
);

export interface ShapelessRecipe {
  result: RecipeItem;
  ingredients: RecipeItem[];
}

export const TShapelessRecipe = t.Object(
  {
    result: TRecipeItem,
    ingredients: t.Array(TRecipeItem),
  },
  { title: "ShapelessRecipe" }
);

export type Recipe = ShapedRecipe | ShapelessRecipe;

export const TRecipe = t.Union([TShapedRecipe, TShapelessRecipe], { title: "Recipe" });

export const TUserRecipe = t.Object({
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
});
