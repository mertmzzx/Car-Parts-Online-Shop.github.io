import ReactDOM from 'react-dom/client';
import './styles/index.css';
import "./styles/admin.css";
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from "./auth/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

