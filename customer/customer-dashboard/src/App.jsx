import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";

function SetupPassword() {
  return <h1>Setup Password</h1>;
}

function Dashboard() {
  return <h1>Customer Dashboard</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/customer/login" element={<Login />} />
        <Route path="/customer/setup-password" element={<SetupPassword />} />
        <Route path="/customer/dashboard" element={<Dashboard />} />

        <Route
          path="*"
          element={<Navigate to="/customer/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;