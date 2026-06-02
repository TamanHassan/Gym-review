import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { gyms as inMemoryGyms } from "../data/gyms.js";

const storeFilename = "gyms.store.json";
const storePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", storeFilename);

const ensureStoreExists = async () => {
  if (!existsSync(storePath)) {
    await writeFile(storePath, JSON.stringify(inMemoryGyms, null, 2), "utf8");
  }
};

export const readGymStore = async () => {
  try {
    await ensureStoreExists();
    const raw = await readFile(storePath, "utf8");
    const gyms = JSON.parse(raw);
    if (!Array.isArray(gyms)) {
      throw new Error("Gym store file is not an array");
    }
    return gyms;
  } catch (error) {
    console.error("Failed to read gym store file:", error);
    return [...inMemoryGyms];
  }
};

export const writeGymStore = async (gyms) => {
  try {
    await writeFile(storePath, JSON.stringify(gyms, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write gym store file:", error);
  }
};
