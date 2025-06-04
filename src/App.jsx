import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import HomePage from "./pages/Home/homepage";
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import PerfilUsuario from './pages/PerfilUsuario/PerfilUsuario';
import ResetPasswordConfirmPage from "./pages/Login/ResetPasswordConfirmPage";
import Home from "./pages/PaginaInicial";
import Quadras from "./pages/Quadras";
import AgendarQuadra from "./pages/Agendamentos/Agendar/agendar";
import ListarAgendamentos from "./pages/Agendamentos/Listar/index";
import OpcoesAgendamento from "./pages/Agendamentos/Opções/opcoesAgendamentos";
import Navbar from "./components/SideBar/Navbar";
import Footer from "./components/Footer/Footer";
import PrivateRoute from "./components/PrivateRoute";

function LayoutComNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública (sem navbar) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/redefinir-senha/:token" element={<ResetPasswordConfirmPage />} />

        {/* Rotas públicas com navbar */}
        <Route element={<LayoutComNavbar />}>
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <PerfilUsuario />
              </PrivateRoute>
            }
          />

          <Route
            path="/quadras"
            element={
              <PrivateRoute>
                <Quadras />
              </PrivateRoute>
            }
          />
          <Route
            path="/listar"
            element={
              <PrivateRoute>
                <ListarAgendamentos />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendar"
            element={
              <PrivateRoute>
                <AgendarQuadra />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendamento/opcoes/:id_agendamento"
            element={
              <PrivateRoute>
                <OpcoesAgendamento />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
