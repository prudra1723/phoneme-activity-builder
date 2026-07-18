import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <Link
          href="/"
          className="footer-brand"
          aria-label="Phoneme Activity Builder home"
        >
          <span className="footer-brand-mark" aria-hidden="true">
            /θ/
          </span>

          <span>Phoneme Activity Builder</span>
        </Link>

        <p className="footer-details">
          © {currentYear} Rudra Pandey
          <br />
          Student Number: 22455439
        </p>
      </div>
    </footer>
  );
}
