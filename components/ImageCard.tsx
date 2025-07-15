import { ImageFile, Result } from "@/lib/ImageFile";
import styles from "./ImageCard.module.css";
import Image from "next/image";
import Button from "./Button";
import Counter from "./Counter";
import { optionsEquals, ProcessOptions } from "@/lib/ProcessImage";
import { useEffect, useState } from "react";
import Modal from "./Modal";

export default function ImageCard({
  imageFile,
  results,
  onSave,
  onDelete,
  onResultSave,
  desc,
  isGrid = false,
  options,
  setOptions,
}: {
  imageFile: ImageFile;
  results?: Result[];
  onSave: () => void;
  onDelete: () => void;
  onResultSave: (image: ImageFile, result: Result) => void;
  desc?: string;
  isGrid?: boolean;
  options?: ProcessOptions;
  setOptions?: (options: ProcessOptions) => void;
}) {
  const [modal, setModal] = useState<string>("");
  const [tempOptions, setTempOptions] = useState<ProcessOptions | undefined>();

  useEffect(() => {
    setTempOptions(options);
  }, [options]);

  return (
    <div className={styles.card}>
      <div className={styles.upper}>
        <Image
          src={imageFile.blobUrl}
          alt={imageFile.name}
          width={imageFile.img.naturalWidth}
          height={imageFile.img.naturalHeight}
          className={styles.thumb}
        />
        <div className={styles.info}>
          <span className={styles.filename}>{imageFile.name}</span>
          <span>
            {imageFile.img.naturalWidth} x {imageFile.img.naturalHeight}
          </span>
          <span>{desc || "Loading..."}</span>
        </div>
        <div className={styles.buttons}>
          <Button
            img="/ig-split/img/download.svg"
            text="Download"
            textVisible="hidden"
            onClick={onSave}
          />
          <Button
            img="/ig-split/img/delete.svg"
            type="danger"
            text="Delete"
            textVisible="hidden"
            onClick={onDelete}
          />
        </div>
      </div>

      {results && tempOptions && (
        <div className={styles.mid}>
          <Button
            img="/ig-split/img/options.svg"
            text="Options"
            onClick={() => setModal("options")}
          />
          <Button
            img="/ig-split/img/reel.svg"
            text="Select Reels"
            onClick={() => setModal("reels")}
          />
          <Button
            img="/ig-split/img/preview.svg"
            text="Preview"
            onClick={() => setModal("preview")}
          />
        </div>
      )}
      {results && results.length > 0 && (
        <div className={styles.lower + (isGrid ? " " + styles.grid : "")}>
          {results.map((result) => (
            <div className={styles.imageContainer} key={result.name}>
              <Image
                src={result.blobUrl}
                alt={result.name}
                width={result.width}
                height={result.height}
              />
              <Button
                img="/ig-split/img/download.svg"
                text="Download"
                textVisible="hidden"
                onClick={() => onResultSave(imageFile, result)}
              />
            </div>
          ))}
        </div>
      )}
      {modal === "options" && options && setOptions && tempOptions && (
        <Modal
          title="Options"
          onClose={() => {
            setModal("");
            setTempOptions(options);
          }}
          showFooter
          onConfirm={() => {
            setModal("");
            setOptions(tempOptions);
          }}
          disableConfirm={optionsEquals(options, tempOptions)}
        >
          <div className={styles.rowEditor}>
            {tempOptions.rowN !== undefined && (
              <>
                <span>Rows</span>
                <Counter
                  count={tempOptions.rowN}
                  min={1}
                  setCount={(n) => {
                    setTempOptions((temp) => {
                      if (temp) {
                        return { ...temp, rowN: n };
                      }
                    });
                  }}
                />
              </>
            )}
            {tempOptions.gap !== undefined && (
              <>
                <span>Gap width</span>
                <Counter
                  count={tempOptions.gap}
                  min={0}
                  setCount={(n) => {
                    setTempOptions((temp) => {
                      if (temp) {
                        return { ...temp, gap: n };
                      }
                    });
                  }}
                />
              </>
            )}
          </div>
        </Modal>
      )}
      {modal === "reels" && options && setOptions && tempOptions && (
        <Modal
          title="Select Reels"
          onClose={() => {
            setModal("");
            setTempOptions(options);
          }}
          showFooter
          onConfirm={() => {
            setModal("");
            setOptions(tempOptions);
          }}
          disableConfirm={optionsEquals(options, tempOptions)}
        >
          <div className={`${styles.grid} ${styles.reels}`}>
            {results &&
              results.map((result, idx) => (
                <button
                  className={
                    styles.imageContainer +
                    (tempOptions.isReel && tempOptions.isReel[idx]
                      ? " " + styles.ticked
                      : "")
                  }
                  key={result.name}
                  onClick={() => {
                    setTempOptions((temp) => {
                      if (temp && temp.isReel) {
                        const isReel = Array.from(temp.isReel);
                        isReel[idx] = !isReel[idx];
                        return { ...temp, isReel };
                      }
                    });
                  }}
                >
                  <Image
                    src={result.blobUrl}
                    alt={result.name}
                    width={result.width}
                    height={result.height}
                  />
                  <div className={styles.tick}>
                    {tempOptions.isReel && tempOptions.isReel[idx] && (
                      <img src="/ig-split/img/check.svg" alt="Check" />
                    )}
                  </div>
                </button>
              ))}
          </div>
        </Modal>
      )}
      {modal === "preview" && isGrid && (
        <Modal
          title="Preview"
          onClose={() => {
            setModal("");
          }}
          fullscreen
        >
          <div className={`${styles.grid} ${styles.preview}`}>
            {results &&
              results.map((result) => (
                <div className={styles.previewContainer} key={result.name}>
                  <Image
                    src={result.blobUrl}
                    alt={result.name}
                    width={result.width}
                    height={result.height}
                  />
                </div>
              ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
