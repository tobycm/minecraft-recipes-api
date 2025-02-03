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

export type RecipeRow = (RecipeItem | null)[];

type RecipeShape = RecipeRow[];

export interface ShapedRecipe {
  result: RecipeItem;
  inShape: RecipeShape;
  outShape?: RecipeShape;
}

export interface ShapelessRecipe {
  result: RecipeItem;
  ingredients: RecipeItem[];
}

export type Recipe = ShapedRecipe | ShapelessRecipe;

export interface Item {
  id: number;
  name: string;
  displayName: string;
  stackSize: number;
}
