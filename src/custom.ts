import { Database } from "bun:sqlite";
import { randomString } from "./utils";

interface DBRecipe {
  id: number;
  name: string;
  recipe: string;
  created: string;
  modified: string;
  adminKey: string;
}

const db = new Database("custom.db", { create: true, strict: true });

db.query(
  "CREATE TABLE IF NOT EXISTS custom (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, recipe TEXT, created DATE, modified DATE, adminKey TEXT);"
);

export function addRecipe(name: string, recipe: string): string {
  const key = randomString(16);
  db.query("INSERT INTO custom (name, recipe, created, modified, adminKey) VALUES ($name, $recipe, $created, $modified, $adminKey);").all({
    $name: name,
    $recipe: recipe,
    $created: new Date().toISOString(),
    $modified: new Date().toISOString(),
    $adminKey: key,
  });
  return key;
}

export function getRecipeById(id: number) {
  return db.query("SELECT * FROM custom WHERE id = $id;").get({ $id: id }) as DBRecipe;
}

export function getRecipeByName(name: string) {
  return db.query("SELECT * FROM custom WHERE name = $name;").get({ $name: name }) as DBRecipe;
}

export function getAllRecipes() {
  return db.query("SELECT * FROM custom;").all() as DBRecipe[];
}

export function deleteRecipeById(id: number) {
  db.query("DELETE FROM custom WHERE id = $id;").run({ $id: id });
}

export function deleteRecipeByName(name: string) {
  db.query("DELETE FROM custom WHERE name = $name;").run({ $name: name });
}

export function updateRecipe(id: number, name: string, recipe: string) {
  db.query("UPDATE custom SET name = $name, recipe = $recipe, modified = $modified WHERE id = $id;").run({
    $id: id,
    $name: name,
    $recipe: recipe,
    $modified: new Date().toISOString(),
  });
}
