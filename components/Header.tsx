import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <Link
      href="/"
      className={styles.header}
    >
      <Image src="/img/logo.svg" alt="IG Split" width={204} height={78} />
    </Link>
  );
}
