import Header from "@/components/Header";
import styles from "./page.module.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <body className={styles.body}>
      <header className={styles.header}>
        <Header />
      </header>
      <main>
        <Nav />
      </main>
      <Footer />
    </body>
  );
}
