import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <p>
        Made by <Link href="https://github.com/joshmoritty">joshmoritty</Link>
      </p>
      <p>
        Source code on{" "}
        <Link href="https://github.com/joshmoritty/ig-split">GitHub</Link>
      </p>
    </footer>
  );
}
