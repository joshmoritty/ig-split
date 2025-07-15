"use client";
import { useState } from "react";
import Button from "./Button";
import styles from "./GridGuide.module.css";
import Modal from "./Modal";
import Counter from "./Counter";
import * as grid from "@/lib/grid.constants";
import { downloadURL } from "@/lib/imageUtils";

const getWidth = (gap: number): number => {
  return (
    grid.defaultPreviewWidth * (grid.defaultColN - 1) +
    grid.defaultWidth +
    gap * (grid.defaultColN - 1)
  );
};

const getHeight = (rowN: number, gap: number): number => {
  return (grid.defaultHeight + gap) * rowN;
};

const generateOverlay = async (rowN: number, gap: number): Promise<string> => {
  const canvas = document.createElement("canvas");

  canvas.width = getWidth(gap);
  canvas.height = getHeight(rowN, gap);

  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  ctx.lineWidth = 1;

  for (let i = 0; i < rowN; i++) {
    for (let j = 0; j < grid.defaultColN; j++) {
      const width = grid.defaultWidth;
      const prevWidth = grid.defaultPreviewWidth;
      const height = grid.defaultHeight;

      const x = j * (prevWidth + gap);
      const y = i * (height + gap) + gap;

      switch (j) {
        case 0:
          ctx.strokeStyle = "red";
          break;
        case 1:
          ctx.strokeStyle = "green";
          break;
        case 2:
          ctx.strokeStyle = "blue";
          break;
      }

      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
      ctx.setLineDash([]);
      ctx.strokeRect(
        x + Math.ceil((width - prevWidth) / 2) + 0.5,
        y + 0.5,
        prevWidth - 1,
        height - 1
      );
    }
  }

  const url = new Promise<string>((resolve) =>
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        }
      },
      "image/png",
      100
    )
  );

  return url;
};

export default function GridGuide() {
  const [open, setOpen] = useState<boolean>(false);
  const [rowN, setRowN] = useState<number>(4);
  const [gap, setGap] = useState<number>(10);
  const [overlayURL, setOverlayURL] = useState<string>("");

  return (
    <>
      <div className={styles.guide}>
        <p>Not sure how to make the grid image?</p>
        <Button
          text={"Grid Guide"}
          img="/ig-split/img/grid.svg"
          onClick={() => setOpen(true)}
        />
      </div>
      {open && (
        <Modal
          title={"Grid Guide"}
          onClose={() => {
            if (overlayURL !== "") {
              URL.revokeObjectURL(overlayURL);
              setOverlayURL("");
            }
            setOpen(false);
          }}
          bodyClassName={styles.modalBody}
        >
          <p>1. Decide how many rows of content you want.</p>
          <div className={styles.rowEditor}>
            <span>Rows</span>
            <Counter count={rowN} min={1} setCount={(n) => setRowN(n)} />
          </div>
          <p>
            2. (Optional) Decide how many pixels the IG grid gap is, so Grid
            Maker can compensate by leaving the same gap between each split.
            This is to prevent a 'stretching' effect between adjacent posts.
            Leave at 10 if unsure, and change to 0 to disable gap compensation.
          </p>
          <div className={styles.rowEditor}>
            <span>Gap width</span>
            <Counter count={gap} min={0} setCount={(n) => setGap(n)} />
          </div>
          <p>
            3. Make your image <strong>{getWidth(gap)} px wide</strong> and{" "}
            <strong>{getHeight(rowN, gap)} px tall</strong>.
          </p>
          <p>
            4. (Optional) Download the grid guidelines overlay and place it on
            top of the image to help with layouting. Solid lines are what's
            visible on the IG grid, dashed lines are where the actual splits
            are. If you want to make a seamless carousel within a post, make
            sure the <strong>left edge</strong> of the second slide lines up
            with the <strong>right dashed line</strong> of that post.
          </p>
          <Button
            text="Download Grid Overlay"
            img="/ig-split/img/download-action.svg"
            type="action"
            className={styles.download}
            onClick={() => {
              generateOverlay(rowN, gap).then((url) => {
                setOverlayURL(url);
                downloadURL(url, "grid-overlay.png");
              });
            }}
          />
        </Modal>
      )}
    </>
  );
}
