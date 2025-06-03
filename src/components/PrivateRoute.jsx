import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const tokenExpiration = localStorage.getItem("token_expiration");

  if (!token || !tokenExpiration) {
    return <Navigate to="/login" replace />;
  }

  const now = Date.now();
  const expirationTimestamp = parseInt(tokenExpiration, 10);

  if (isNaN(expirationTimestamp) || now > expirationTimestamp) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiration");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;