import Link from "next/link";

export default function Logo({ className = "text-white" }) {
  return (
    <Link
      href="/"
      className={`${className} inline-flex items-center text-[1.375rem] uppercase leading-none transition-colors duration-300 translate-y-[2px]`}
      style={{ fontFamily: "Ahsing" }}
    >
      La Fleur
    </Link>
  );
}
