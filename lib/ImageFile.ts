export interface ImageFile {
  id: string,
  name: string;
  blobUrl: string;
  width: number;
  height: number;
  results: Result[]
}

export interface Result {
  name: string;
  blobUrl: string;
  width: number;
  height: number;
}
