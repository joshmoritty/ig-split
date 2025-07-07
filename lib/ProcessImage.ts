import { ImageFile, Result } from "./ImageFile";

export interface ProcessOptions {
  rowN?: number;
  gap?: number;
  isReel?: boolean[];
}

export function optionsEquals(a: ProcessOptions, b: ProcessOptions) {
  return (
    a.gap === b.gap &&
    a.rowN === b.rowN &&
    ((!a.isReel && !b.isReel) ||
      a.isReel?.every((v, idx) => b.isReel && v === b.isReel[idx]))
  );
}

export type ProcessImage = (image: ImageFile) => Promise<ImageFile>;
