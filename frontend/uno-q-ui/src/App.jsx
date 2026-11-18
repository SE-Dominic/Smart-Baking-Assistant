import { HashRouter, Route, Routes } from "react-router-dom";
import CookbookShelf from "./CookbookShelf_Seamless";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <HashRouter>
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/recipe" element={<CookbookShelf />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
