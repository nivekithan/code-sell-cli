#!/usr/bin/env node
import chalk from "chalk";
import { getManifest, isManifestPresent } from "./manifest.js";
import FormData from "form-data";
import { getTarball } from "./tarball.js";
import yargs, { hide } from "yargs";
import { hideBin } from "yargs/helpers";
import fetch from "node-fetch";
import path from "path";
import { cwd } from "./path.js";

const main = async () => {
  const isPresent = await isManifestPresent();

  if (isPresent) {
    const fd = await getFormData();
    await postTarballToRegistry(fd);
  } else {
    console.log(chalk.red("package.json is not present"));
    process.exit(1);
  }
};

const postTarballToRegistry = async (fd: FormData) => {
  const packageName = encodeURIComponent(await getNameOfPackage());
  const packageVersion = encodeURIComponent(await getVersionOfPackage());

  const res = await fetch(
    `http://localhost:5000/${packageName}/${packageVersion}`,
 {
      method: "POST",
      body: fd,
      headers: fd.getHeaders(),
    }   
  );
  console.log(await res.json());
};

const getTarballPath = () => {
  const argv = yargs(hideBin(process.argv))
    .command("publish <path>", "publish the specified tarball to registry")
    .demandCommand(1)
    .parseSync();

  if (argv._.length < 1) {
    console.error(chalk.red("There are no commands"));
    process.exit(1);
  } else if (argv._.length === 1) {
    if (argv._[0] !== "publish") {
      console.error(chalk.red("The only valid command is publish"));
      process.exit(1);
    }

    const { path: p } = argv;

    if (typeof p !== "string" || p === "") {
      console.error(chalk.red("Provide valid file input"));
      process.exit(1);
    }

    return path.resolve(cwd, p);
  } else if (argv._.length > 1) {
    console.error(chalk.red("It is not valid input"));
    process.exit(1);
  }
};

const getFormData = async () => {
  const path = getTarballPath();
  const fd = new FormData();

  const [name, version] = await Promise.all([
    getNameOfPackage(),
    getVersionOfPackage(),
  ]);

  fd.append("name", name);
  fd.append("version", version);
  fd.append("tarball", getTarball(path));

  return fd;
};

const getNameOfPackage = async () => {
  const manifest = await getManifest();
  return manifest.name;
};

const getVersionOfPackage = async () => {
  const manifest = await getManifest();
  return manifest.version;
};

main();
