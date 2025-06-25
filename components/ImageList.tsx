"use client";
import Image from "next/image";
import button from "./Button.module.css";
import styles from "./ImageList.module.css";
import ImageCard from "./ImageCard";
import { ImageFile, Result } from "@/lib/ImageFile";
import { ChangeEvent, useCallback, useState } from "react";
import Button from "./Button";
import JSZip from "jszip";
import removeExtension from "@/lib/removeExtension";
import { useDropzone } from "react-dropzone";

export default function ImageList({
  processImage,
}: {
  processImage: (
    img: HTMLImageElement,
    width: number,
    height: number,
    fileType: string
  ) => Promise<Result[]>;
}) {
  const [images, setImages] = useState<ImageFile[]>([]);

  const addFiles = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      const blobUrl = URL.createObjectURL(files[i]);

      const id = blobUrl;
      const name = files[i].name;
      const data = blobUrl;
      const fileType = files[i].type;

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = document.createElement("img");
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = data;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const results = await processImage(img, width, height, fileType);

      const imageFile: ImageFile = {
        id,
        name,
        blobUrl,
        width,
        height,
        results,
      };

      setImages((images) => [...images, imageFile]);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
  });

  const onAddButtonClick = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList || fileList.length === 0) return;

    const files: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      files.push(fileList[i]);
    }

    await addFiles(files);
    e.target.value = "";
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
    for (const r of image.results) {
      const blob = await fetch(r.blobUrl).then((r) => r.blob());
      zip.file(getResultFileName(image, r), blob);
    }
  };

  const saveImage = async (image: ImageFile) => {
    const zip = new JSZip();
    await saveResults(zip, image);
    await downloadZip(zip, removeExtension(image.name) + ".zip");
  };

  const saveAll = async () => {
    if (images.length === 1) {
      await saveImage(images[0]);
    } else {
      const zip = new JSZip();
      const usedNames = new Map<string, number>();
      for (const i of images) {
        let name = removeExtension(i.name);

        if (usedNames.has(name)) {
          const prev = usedNames.get(name);
          if (prev) usedNames.set(name, prev + 1);
          name = name + " (" + prev + ")";
        } else {
          usedNames.set(name, 1);
        }

        const img = zip.folder(name);
        if (img) await saveResults(img, i);
      }
      await downloadZip(zip, "split-images.zip");
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        id="image-input"
        className={styles.input}
        multiple
        onChange={onAddButtonClick}
      />
      {images.length == 0 && (
        <>
          <div {...getRootProps()} className={styles.drag}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drag and drop images here...</p>
            ) : (
              <p>Drag and drop images here, or click to select</p>
            )}
            <label
              htmlFor="image-input"
              className={`${button.button} ${button.action}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src="/img/image-action.svg"
                alt="Select Images"
                width={32}
                height={32}
              />
              Select Images
            </label>
          </div>
        </>
      )}
      {images.length > 0 && (
        <>
          <div
            className={
              styles.buttons + (images.length > 0 ? " " + styles.added : "")
            }
          >
            <label htmlFor="image-input" className={button.button}>
              <Image
                src="/img/image.svg"
                alt="Add Images"
                width={32}
                height={32}
              />
              Add Images
            </label>
            <Button
              type="action"
              text="Save All Images"
              img="/img/download-action.svg"
              onClick={saveAll}
            />
          </div>
          <div className={styles.list}>
            {images.map((i) => (
              <ImageCard
                key={i.id}
                imageFile={i}
                onSave={async () => await saveImage(i)}
                onDelete={() => {
                  i.results?.forEach((r) => URL.revokeObjectURL(r.blobUrl));
                  URL.revokeObjectURL(i.blobUrl);
                  setImages((images) => images.filter((im) => im.id !== i.id));
                }}
                onResultSave={(result) => {
                  downloadURL(result.blobUrl, getResultFileName(i, result));
                }}
                desc={
                  i.results.length +
                  " slide" +
                  (i.results.length > 1 ? "s" : "")
                }
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
