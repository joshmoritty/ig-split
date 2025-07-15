import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <Link href="/" className={styles.header}>
      <img
        src="/ig-split/img/logo.svg"
        alt="IG Split"
      />
    </Link>
  );
}
