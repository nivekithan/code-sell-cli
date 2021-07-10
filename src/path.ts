import path from "path";

export const cwd = process.cwd();
export const manifestPath = path.resolve(cwd, "package.json");
