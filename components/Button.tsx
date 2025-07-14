import { MouseEventHandler } from "react";
import styles from "./Button.module.css";
import Image from "next/image";

export default function Button({
  onClick,
  type,
  text,
  textVisible = "visible",
  img,
  className = "",
  disabled = false,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "action" | "danger" | undefined;
  text: string;
  textVisible?: "visible" | "hidden" | "hiddenMobile";
  img?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={`${
        styles.button +
        (type ? " " + styles[type] : "") +
        (textVisible !== "visible" ? " " + styles[textVisible] : "") +
        (disabled ? " " + styles.disabled : "") +
        (" " + className)
      }`}
      onClick={(e) => {
        if (onClick && !disabled) onClick(e);
      }}
    >
      {img && text && (
        <Image src={img} alt={text} width={32} height={32} unoptimized />
      )}
      {text && textVisible !== "hidden" && <span>{text}</span>}
    </button>
  );
}
