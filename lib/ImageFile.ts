import { ProcessOptions } from "./ProcessImage";

export interface ImageFile {
  name: string;
  blobUrl: string;
  fileType: string;
  img: HTMLImageElement;
  results?: Result[]
  options?: ProcessOptions
}

export interface Result {
  name: string;
  blobUrl: string;
  width: number;
  height: number;
}
