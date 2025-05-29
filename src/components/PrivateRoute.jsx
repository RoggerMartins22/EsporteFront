import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const tokenExpiration = localStorage.getItem("token_expiration");

  if (!token || !tokenExpiration) {
    return <Navigate to="/login" />;
  }

  const now = new Date().getTime();
  if (now > parseInt(tokenExpiration, 10)) {
    // token expirou
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiration");
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
