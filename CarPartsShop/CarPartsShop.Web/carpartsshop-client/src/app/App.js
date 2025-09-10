// src/app/App.js
import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes";
import Providers from "./providers";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartFab from "../components/CartFab";
import { AuthProvider } from "../context/AuthContext";

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-vh-100 d-flex flex-column">
            <Header />
            <main className="container-fluid px-0 flex-grow-1">
              <RoutesConfig />
            </main>
            <Footer />
            <CartFab /> {/* 👈 floating cart always visible */}
          </div>
        </AuthProvider>F
      </BrowserRouter>
    </Providers>
  );
}
