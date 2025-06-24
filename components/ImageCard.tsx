import { ImageFile, Result } from "@/lib/ImageFile";
import styles from "./ImageCard.module.css";
import Image from "next/image";
import Button from "./Button";

export default function ImageCard({
  imageFile,
  onSave,
  onDelete,
  onResultSave,
  desc,
}: {
  imageFile: ImageFile;
  onSave: () => void;
  onDelete: () => void;
  onResultSave: (result: Result) => void;
  desc?: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.upper}>
        <Image
          src={imageFile.blobUrl}
          alt={imageFile.name}
          width={imageFile.width}
          height={imageFile.height}
          className={styles.thumb}
        />
        <div className={styles.info}>
          <span className={styles.filename}>{imageFile.name}</span>
          <span>
            {imageFile.width} x {imageFile.height}
          </span>
          {desc && <span>{desc}</span>}
        </div>
        <div className={styles.buttons}>
          <Button
            img="/img/download.svg"
            text="Download"
            textVisible="hidden"
            onClick={onSave}
          />
          <Button
            img="/img/delete.svg"
            type="danger"
            text="Delete"
            textVisible="hidden"
            onClick={onDelete}
          />
        </div>
      </div>
      {imageFile.results.length > 0 && (
        <div className={styles.lower}>
          {imageFile.results.map((result) => (
            <div className={styles.imageContainer} key={result.name}>
              <Image
                src={result.blobUrl}
                alt={result.name}
                width={result.width}
                height={result.height}
              />
              <Button
                img="/img/download.svg"
                text="Download"
                textVisible="hidden"
                onClick={() => onResultSave(result)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
