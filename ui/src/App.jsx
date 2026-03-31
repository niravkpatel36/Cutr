import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RedirectHandler from "./RedirectHandler.jsx";
import Home from "./pages/Home.jsx";
import NotFoundPage from "./pages/404.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoaderPage from "./pages/LoaderPage.jsx";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";

const App = () => {
  const [pin, setPin] = useState(() => {
    const storedPin = localStorage.getItem("pin");
    return storedPin || "";
  });

  useEffect(() => {
    if (pin) {
      localStorage.setItem("pin", pin);
    }
  }, [pin]);
  return (
    <div>
      <ThemeSwitcher />
      <Router>
        <Routes>
          <Route path="/" element={<Home setPin={setPin} />} />
          <Route
            path="/analytics/:shortUrl"
            element={<ProtectedRoute element={AnalyticsPage} pin={pin} />}
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/:shortUrl" element={<RedirectHandler />} />
          <Route path="/loader" element={<LoaderPage message={"Loading"} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
