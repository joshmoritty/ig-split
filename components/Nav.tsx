"use client";
import Link from "next/link";
import styles from "./Nav.module.css";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  return (
    <nav
      className={`${styles.nav + (path === "/" ? " " + styles.navHome : "")}`}
    >
      <Link href="/grid" className={path === "/grid" ? styles.active : ""}>
        <Image
          src={
            path === "/grid"
              ? "/ig-split/img/grid-active.svg"
              : "/ig-split/img/grid.svg"
          }
          alt="Grid"
          width={32}
          height={32}
        />
        <span>Grid Maker</span>
      </Link>
      <Link
        href="/carousel"
        className={path === "/carousel" ? styles.active : ""}
      >
        <Image
          src={
            path === "/carousel"
              ? "/ig-split/img/carousel-active.svg"
              : "/ig-split/img/carousel.svg"
          }
          alt="Carousel"
          width={32}
          height={32}
        />
        <span>Carousel Split</span>
      </Link>
    </nav>
  );
}
