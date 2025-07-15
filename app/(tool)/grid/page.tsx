"use client";
import GridGuide from "@/components/GridGuide";
import ImageList from "@/components/ImageList";
import { Result } from "@/lib/ImageFile";
import { ProcessImage } from "@/lib/ProcessImage";
import * as grid from "@/lib/grid.constants"

const processImage: ProcessImage = async (image) => {
  const img = image.img;
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  console.log(image.options);

  const opt = image.options ? image.options : {};
  const colN = grid.defaultColN;
  const gap = opt.gap !== undefined ? opt.gap : grid.defaultGap;
  opt.gap = gap;

  const gapAspect = gap / (grid.defaultHeight + gap);
  const rowAspect =
    (grid.defaultPreviewWidth * colN +
      gap * 2 +
      (grid.defaultWidth - grid.defaultPreviewWidth)) /
    (grid.defaultHeight + gap);

  let rowN, rowWidth, rowHeight, cropX;

  if (opt.rowN && (width / rowAspect) * opt.rowN > height) {
    rowN = opt.rowN;
    rowHeight = Math.floor(height / rowN);
    rowWidth = rowHeight * rowAspect;
    cropX = Math.floor((width - rowWidth) / 2);
  } else {
    rowWidth = width;
    rowHeight = Math.round(rowWidth / rowAspect);
    if (opt && opt.rowN) {
      rowN = opt.rowN;
    } else {
      rowN = Math.floor(height / rowHeight);
      opt.rowN = rowN;
    }
    cropX = 0;
  }
  
  const gapWidth = Math.round(gapAspect * rowHeight);
  const cutoffWidth = Math.round(
    ((grid.defaultWidth - grid.defaultPreviewWidth) / (grid.defaultHeight + gap)) * rowHeight
  );

  const cropY = height - rowHeight * rowN + gapWidth;

  const resultHeight = rowHeight - gapWidth;
  const resultWidth = Math.round(
    (grid.defaultWidth / (grid.defaultHeight + gap)) * rowHeight
  );

  const resultN = opt.rowN * 3;

  if (!opt.isReel) {
    opt.isReel = new Array(opt.rowN * 3).fill(false);
  } else if (opt.isReel.length > resultN) {
    opt.isReel = opt.isReel.slice(0, resultN);
  } else if (opt.isReel.length < resultN) {
    opt.isReel = opt.isReel.concat(
      new Array(resultN - opt.isReel.length).fill(0)
    );
  }

  const results: Result[] = [];
  let resultI = resultN;

  for (let i = 0; i < rowN; i++) {
    for (let j = 0; j < colN; j++) {
      const canvas = document.createElement("canvas");

      if (opt.isReel[results.length]) {
        canvas.width = grid.reelWidth;
        canvas.height = grid.reelHeight;
      } else {
        canvas.width = resultWidth;
        canvas.height = resultHeight;
      }

      const ctx = canvas.getContext("2d");

      let x = cropX + j * (resultWidth + gapWidth - cutoffWidth);
      const y = cropY + i * (resultHeight + gapWidth);

      const canvasX = 0,
        sourceHeight = resultHeight;
      let sourceWidth = resultWidth,
        canvasY = 0,
        canvasWidth = resultWidth,
        canvasHeight = resultHeight;

      if (opt.isReel[results.length]) {
        sourceWidth = resultWidth * (grid.defaultPreviewWidth / grid.defaultWidth);
        x += (resultWidth - sourceWidth) / 2;
        canvasWidth = grid.reelWidth;
        canvasHeight =
          Math.ceil(grid.reelWidth * (resultHeight / sourceWidth)) +
          grid.reelHeightOffset;
        canvasY = Math.floor((grid.reelHeight - canvasHeight) / 2) + grid.reelYOffset;

        if (ctx) ctx.fillStyle = "white";
        ctx?.fillRect(0, 0, grid.reelWidth, grid.reelHeight);
      }

      ctx?.drawImage(
        img,
        x,
        y,
        sourceWidth,
        sourceHeight,
        canvasX,
        canvasY,
        canvasWidth,
        canvasHeight
      );

      const result = await new Promise<Result>((resolve) =>
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                name: ("00" + resultI--).slice(-2),
                blobUrl: URL.createObjectURL(blob),
                width: resultWidth,
                height: resultHeight,
              });
            }
          },
          image.fileType,
          100
        )
      );

      results.push(result);
    }
  }

  return { ...image, results, options: opt };
};

export default function Home() {
  return (
    <>
      <ImageList processImage={processImage} isGrid />
      <GridGuide />
    </>
  );
}
