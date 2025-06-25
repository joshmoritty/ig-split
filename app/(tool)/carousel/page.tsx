"use client";
import ImageList from "@/components/ImageList";
import { Result } from "@/lib/ImageFile";

const defaultAspect = 4 / 5;

const processImage = async (
  img: HTMLImageElement,
  width: number,
  height: number,
  fileType: string
): Promise<Result[]> => {
  const n = Math.floor(width / height / defaultAspect);

  const resultHeight = height;
  const resultWidth = defaultAspect * resultHeight;

  const results: Result[] = [];

  for (let j = 0; j < n; j++) {
    const canvas = document.createElement("canvas");
    canvas.width = resultWidth;
    canvas.height = resultHeight;
    const ctx = canvas.getContext("2d");

    ctx?.drawImage(
      img,
      resultWidth * j,
      0,
      resultWidth,
      resultHeight,
      0,
      0,
      resultWidth,
      resultHeight
    );

    const result = await new Promise<Result>((resolve) =>
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              name: ("00" + (j + 1)).slice(-2),
              blobUrl: URL.createObjectURL(blob),
              width: resultWidth,
              height: resultHeight,
            });
          }
        },
        fileType,
        100
      )
    );

    results.push(result);
  }

  return results;
};

export default function Home() {
  return (
    <>
      <ImageList processImage={processImage} />
    </>
  );
}
