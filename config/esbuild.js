const esbuild = require("esbuild");
const fs = require("fs/promises");
const path = require("path");

const cwd = path.resolve(__dirname, "..");
const srcDir = path.resolve(cwd, "src");
const buildDir = path.resolve(cwd, "build");

const getFilePaths = async (dirName) => {
  const dirents = await fs.readdir(dirName, { withFileTypes: true });

  const fileNames = [];

  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      const absoluteDirName = path.resolve(dirName, dirent.name);
      const dirFileNames = await getFilePaths(absoluteDirName);
      fileNames.push(...dirFileNames);
    } else {
      const absolutePath = path.resolve(dirName, dirent.name);
      fileNames.push(absolutePath);
    }
  }

  return fileNames;
};

const clearBuildDir = async () => {
  try {
    const buildDirStatus = await fs.stat(buildDir);

    if (buildDirStatus.isDirectory()) {
      await fs.rm(buildDir, { recursive: true });
    }
  } catch (err) {}
};

const generateJsFiles = async () => {
  const [allFileNames] = await Promise.all([
    getFilePaths(srcDir),
    clearBuildDir(),
  ]);

  await esbuild.build({
    entryPoints: allFileNames,
    outdir: "build",
    outbase: "src",
    format: "cjs",
    sourcemap: true,
    watch: {
      onRebuild(err, res) {
        if (err) {
          console.log("Esbuild Build Failed: " + err);
          return;
        } else {
          console.log("Esbuild Build Success");
        }
      },
    },
  });
};

(async () => {
  await generateJsFiles();
})();
