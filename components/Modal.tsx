"use client";
import { useEffect } from "react";
import Button from "./Button";
import styles from "./Modal.module.css";

export default function Modal({
  title,
  showFooter = false,
  disableConfirm = false,
  fullscreen = false,
  onClose,
  onConfirm,
  bodyClassName,
  children,
}: {
  title: string;
  showFooter?: boolean;
  disableConfirm?: boolean;
  fullscreen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  bodyClassName?: string;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add(styles.disableScroll);

    return () => {
      document.body.classList.remove(styles.disableScroll);
    };
  }, []);

  return (
    <div className={styles.mask + (fullscreen ? " " + styles.fullscreen : "")}>
      <div className={styles.window}>
        <div className={styles.header}>
          <Button
            text="Close"
            img="/ig-split/img/close.svg"
            textVisible="hidden"
            className={styles.close}
            onClick={onClose}
          />
          <h1>{title}</h1>
        </div>
        <div
          className={styles.body + (bodyClassName ? " " + bodyClassName : "")}
        >
          {children}
        </div>
        {showFooter && (
          <div className={styles.footer}>
            <Button
              onClick={onConfirm}
              type="action"
              text="Confirm"
              disabled={disableConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
}
