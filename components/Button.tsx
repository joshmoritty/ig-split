import { MouseEventHandler } from "react";
import styles from "./Button.module.css";
import Image from "next/image";

export default function Button({
  onClick,
  type,
  text,
  textVisible = "visible",
  img,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "action" | "danger" | undefined;
  text: string;
  textVisible?: "visible" | "hidden" | "hiddenMobile";
  img?: string;
}) {
  return (
    <button
      className={`${
        styles.button +
        (type ? " " + styles[type] : "") +
        (textVisible !== "visible" ? " " + styles[textVisible] : "")
      }`}
      onClick={onClick}
    >
      {img && text && <Image src={img} alt={text} width={32} height={32} />}
      {text && textVisible !== "hidden" && <span>{text}</span>}
    </button>
  );
}
