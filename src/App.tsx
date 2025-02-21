import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { Toaster } from "sonner";
import ScoresPage from "./routes/scores";
import LoginPage from "./routes/login";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/scores" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/scores"
            element={
              <PrivateRoute>
                <ScoresPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/scores" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
