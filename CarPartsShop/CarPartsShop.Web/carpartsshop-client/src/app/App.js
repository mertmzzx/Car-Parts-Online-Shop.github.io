import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes";
import Providers from "./providers";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="container my-4">
        <RoutesConfig />
      </main>
      <Footer />
    </BrowserRouter>
  );
}
