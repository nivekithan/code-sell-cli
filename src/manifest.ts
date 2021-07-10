import { NormalizedPackageJson, readPackageAsync } from "read-pkg";
import fs from "fs/promises";
import { manifestPath } from "./path.js";

const manifest: { file: NormalizedPackageJson | undefined } = {
  file: undefined,
};

export const isManifestPresent = async () => {
  if (manifest.file) {
    return true;
  }

  try {
    const file = await fs.stat(manifestPath);
    return file.isFile();
  } catch (err) {
    return false;
  }
};

export const getManifest = async () => {
  if (manifest.file) {
    return manifest.file;
  } else {
    const file: NormalizedPackageJson = await readPackageAsync();
    manifest.file = file;
    return manifest.file;
  }
};
