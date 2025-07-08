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
import { ProcessImage } from "@/lib/ProcessImage";

export default function ImageList({
  processImage,
  isGrid = false,
}: {
  processImage: ProcessImage;
  isGrid?: boolean;
}) {
  const [images, setImages] = useState<ImageFile[]>([]);

  const reprocess = async (image: ImageFile) => {
    const newImage = await processImage(image);

    setImages((images) =>
      images.map((i) => (i.blobUrl === newImage.blobUrl ? newImage : i))
    );
  };

  const addFiles = async (files: File[]) => {
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

      setImages((images) => [...images, image]);

      reprocess(image);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
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
    if (!image.results) return;

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

  return (
    <>
      <input
        type="file"
        accept=".png,.jfif,.pjp,.jpg,.pjpeg,.jpeg,.webp"
        id="image-input"
        className={styles.input}
        multiple
        onChange={onAddButtonClick}
      />
      {images.length == 0 && (
        <>
          <div
            {...getRootProps()}
            className={
              styles.drag + (isDragActive ? " " + styles.dragActive : "")
            }
          >
            <input {...getInputProps()} />
            <p>Drag and drop images here, or click to select</p>
            <label
              htmlFor="image-input"
              className={`${button.button} ${button.action}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src="/ig-split/img/image-action.svg"
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
                src="/ig-split/img/image.svg"
                alt="Add Images"
                width={32}
                height={32}
              />
              Add Images
            </label>
            <Button
              type="action"
              text="Save All Images"
              img="/ig-split/img/download-action.svg"
              onClick={saveAll}
            />
          </div>
          <div className={styles.list}>
            {images.map((i) => (
              <ImageCard
                key={i.blobUrl}
                imageFile={i}
                results={i.results}
                onSave={async () => await saveImage(i)}
                onDelete={() => {
                  if (i.results) {
                    i.results.forEach((r) => URL.revokeObjectURL(r.blobUrl));
                  }
                  URL.revokeObjectURL(i.blobUrl);
                  setImages((images) =>
                    images.filter((im) => im.blobUrl !== i.blobUrl)
                  );
                }}
                onResultSave={(result) => {
                  downloadURL(result.blobUrl, getResultFileName(i, result));
                }}
                desc={
                  i.results &&
                  (isGrid
                    ? i.results.length + " posts (" + i.options?.rowN + " rows)"
                    : i.results.length +
                      " slide" +
                      (i.results.length > 1 ? "s" : ""))
                }
                isGrid={isGrid}
                options={i.options}
                setOptions={(options) => {
                  setImages((images) => {
                    return images.map((im) => {
                      if (im.blobUrl !== i.blobUrl) return im;

                      const newImage = { ...im, options, results: undefined };

                      reprocess(newImage);
                      return newImage;
                    });
                  });
                }}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
