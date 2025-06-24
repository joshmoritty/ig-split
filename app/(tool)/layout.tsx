import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ToolLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body>
      <header>
        <Header />
        <Nav />
      </header>
      <main>{children}</main>
      <Footer />
    </body>
  );
}
