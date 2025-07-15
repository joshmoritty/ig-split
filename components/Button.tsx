import { MouseEventHandler } from "react";
import styles from "./Button.module.css";

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
      {img && text && <img src={img} alt={text} />}
      {text && textVisible !== "hidden" && <span>{text}</span>}
    </button>
  );
}
