export default function Footer() {
  return (
    <footer className="py-4 bg-light mt-5">
      <div className="container text-center text-muted">
        © {new Date().getFullYear()} Car Parts Shop
      </div>
    </footer>
  );
}
