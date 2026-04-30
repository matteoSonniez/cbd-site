import "./globals.css";
import FlowingBackground from "@/components/FlowingBackground";
import HeaderBar from "@/components/HeaderBar";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-heading",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${montserrat.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <FlowingBackground />
        <HeaderBar />
        {children}
      </body>
    </html>
  );
}
