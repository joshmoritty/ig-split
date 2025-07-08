"use client";
import Image from "next/image";
import button from "./Button.module.css";
import styles from "./ImageList.module.css";
import ImageCard from "./ImageCard";
import { ImageFile } from "@/lib/ImageFile";
import { ChangeEvent, useState } from "react";
import Button from "./Button";
import { useDropzone } from "react-dropzone";
import { ProcessImage } from "@/lib/ProcessImage";
import {
  readImageFiles,
  reprocessImage,
  saveAll,
  saveImage,
  saveResult,
} from "@/lib/imageUtils";

export default function ImageList({
  processImage,
  isGrid = false,
}: {
  processImage: ProcessImage;
  isGrid?: boolean;
}) {
  const [images, setImages] = useState<ImageFile[]>([]);

  const updateImage = (image: ImageFile) => {
    setImages((images) =>
      images.map((i) => (i.blobUrl === image.blobUrl ? image : i))
    );
  };

  const addImage = (image: ImageFile) => {
    setImages((images) => [...images, image]);
  };

  const reprocess = (image: ImageFile) =>
    reprocessImage(image, processImage, updateImage);

  const onDrop = (acceptedFiles: File[]) => {
    readImageFiles(acceptedFiles, addImage, reprocess);
  };

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

    await readImageFiles(files, addImage, updateImage);
    e.target.value = "";
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
              onClick={() => saveAll(images)}
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
                onResultSave={saveResult}
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
