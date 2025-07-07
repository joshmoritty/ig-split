"use client";
import ImageList from "@/components/ImageList";
import { Result } from "@/lib/ImageFile";
import { ProcessImage } from "@/lib/ProcessImage";

const defaultWidth = 1080;
const defaultHeight = 1350;
const defaultPreviewWidth = 1015;
const defaultGap = 10;
const defaultColN = 3;

const reelWidth = 1080;
const reelHeight = 1920;
const reelHeightOffset = 4;
const reelYOffset = 1;

const processImage: ProcessImage = async (image) => {
  const img = image.img;
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  console.log(image.options);

  const opt = image.options ? image.options : {};
  const colN = defaultColN;
  const gap = opt.gap !== undefined ? opt.gap : defaultGap;
  opt.gap = gap;

  const gapAspect = gap / (defaultHeight + gap);
  const rowAspect =
    (defaultPreviewWidth * colN +
      gap * 2 +
      (defaultWidth - defaultPreviewWidth)) /
    (defaultHeight + gap);

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
  const cropY = height - rowHeight * rowN;

  const gapWidth = Math.round(gapAspect * rowHeight);
  const cutoffWidth = Math.round(
    ((defaultWidth - defaultPreviewWidth) / (defaultHeight + gap)) * rowHeight
  );

  const resultHeight = rowHeight - gapWidth;
  const resultWidth = Math.round(
    (defaultWidth / (defaultHeight + gap)) * rowHeight
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
        canvas.width = reelWidth;
        canvas.height = reelHeight;
      } else {
        canvas.width = resultWidth;
        canvas.height = resultHeight;
      }

      const ctx = canvas.getContext("2d");

      let x = cropX + j * (resultWidth + gapWidth - cutoffWidth);
      const y = cropY + i * (resultHeight + gapWidth);

      const canvasX = 0;
      let sourceWidth = resultWidth,
        sourceHeight = resultHeight,
        canvasY = 0,
        canvasWidth = resultWidth,
        canvasHeight = resultHeight;

      if (opt.isReel[results.length]) {
        sourceWidth = resultWidth * (defaultPreviewWidth / defaultWidth);
        x += (resultWidth - sourceWidth) / 2;
        canvasWidth = reelWidth;
        canvasHeight =
          Math.ceil(reelWidth * (resultHeight / sourceWidth)) +
          reelHeightOffset;
        canvasY = Math.floor((reelHeight - canvasHeight) / 2) + reelYOffset;

        if (ctx) ctx.fillStyle = "white";
        ctx?.fillRect(0, 0, reelWidth, reelHeight);
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
  return <ImageList processImage={processImage} isGrid />;
}
