import { createReadStream } from "fs";

export const getTarball = (tarball: string) => {
  return createReadStream(tarball);
};
