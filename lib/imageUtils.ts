import JSZip from "jszip";
import { ImageFile, Result } from "./ImageFile";
import { ProcessImage } from "./ProcessImage";
import removeExtension from "@/lib/removeExtension";

export const reprocessImage = async (
  image: ImageFile,
  processImage: ProcessImage,
  updateImage: (image: ImageFile) => void
) => {
  const newImage = await processImage(image);

  updateImage(newImage);
};

export const readImageFiles = async (
  files: File[],
  addImage: (image: ImageFile) => void,
  processImage: (image: ImageFile) => void
) => {
  for (let i = 0; i < files.length; i++) {
    const blobUrl = URL.createObjectURL(files[i]);

    const name = files[i].name;
    const data = blobUrl;
    const fileType = files[i].type;

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = document.createElement("img");
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = data;
    });

    const image: ImageFile = {
      blobUrl,
      name,
      fileType,
      img,
    };

    addImage(image);

    processImage(image);
  }
};

const getResultFileName = (image: ImageFile, result: Result) =>
  result.name + " " + image.name;

const downloadURL = (url: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
};

const downloadZip = async (zip: JSZip, fileName: string) => {
  const blob = await zip.generateAsync({ type: "blob" });

  const url = URL.createObjectURL(blob);
  downloadURL(url, fileName);
  URL.revokeObjectURL(url);
};

const saveResults = async (zip: JSZip, image: ImageFile) => {
  if (!image.results) return;

  for (const r of image.results) {
    const blob = await fetch(r.blobUrl).then((r) => r.blob());
    zip.file(getResultFileName(image, r), blob);
  }
};

export const saveImage = async (image: ImageFile) => {
  const zip = new JSZip();
  await saveResults(zip, image);
  await downloadZip(zip, removeExtension(image.name) + ".zip");
};

export const saveAll = async (images: ImageFile[]) => {
  if (images.length === 1) {
    await saveImage(images[0]);
  } else {
    const zip = new JSZip();
    const usedNames = new Map<string, number>();
    for (let i = 0; i < images.length; i++) {
      let name = removeExtension(images[i].name);

      if (usedNames.has(name)) {
        const prev = usedNames.get(name);
        if (prev) usedNames.set(name, prev + 1);
        name = name + " (" + prev + ")";
      } else {
        usedNames.set(name, 1);
      }

      const img = zip.folder(name);
      if (img) await saveResults(img, images[i]);
    }
    await downloadZip(zip, "split-images.zip");
  }
};

export const saveResult = (image: ImageFile, result: Result) => {
  downloadURL(result.blobUrl, getResultFileName(image, result));
};
