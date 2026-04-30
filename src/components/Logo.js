import Link from "next/link";

export default function Logo({ className = "text-white" }) {
  return (
    <Link
      href="/"
      className={`${className} text-3xl uppercase leading-none transition-colors duration-300`}
      style={{ fontFamily: "Ahsing" }}
    >
      La Fleur
    </Link>
  );
}
