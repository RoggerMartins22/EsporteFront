import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import styles from "./login.module.css";
import { FaSignInAlt, FaUserPlus, FaExclamationCircle } from "react-icons/fa";

const formatCpfDisplay = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

function Login() {
  const cpfInputRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const [rawCpfValue, setRawCpfValue] = useState("");
  const [formattedCpfDisplay, setFormattedCpfDisplay] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/home");
    }
  }, [navigate]);

  useEffect(() => {
    cpfInputRef.current?.focus();
  }, []);

  const handleCpfInputChange = (e) => {
    const inputValue = e.target.value;
    const currentRawDigits = inputValue.replace(/\D/g, "");

    if (currentRawDigits.length <= 11) {
      setRawCpfValue(currentRawDigits);
      setFormattedCpfDisplay(formatCpfDisplay(currentRawDigits));
    }
    if (error) setError("");
  };

  const handlePasswordChange = () => {
    if (error) setError("");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cpf = rawCpfValue.trim();
    const senha = passwordRef.current.value.trim();

    if (!cpf || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (cpf.length !== 11) {
      setError("CPF inválido. Deve conter 11 dígitos numéricos.");
      cpfInputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", cpf);
      formData.append("password", senha);

      const { data } = await api.post("/usuario/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", data.access_token);
      const expirationTimestamp = new Date().getTime() + (data.expires_in * 1000);
      localStorage.setItem("token_expiration", expirationTimestamp.toString());

      navigate("/home");
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Erro ao tentar fazer login. Verifique suas credenciais.";
      setError(errorMessage);
      if (errorMessage.toLowerCase().includes("cpf") || errorMessage.toLowerCase().includes("usuário")) {
        cpfInputRef.current?.focus();
      } else if (errorMessage.toLowerCase().includes("senha")) {
        passwordRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginContainer}>
        <header className={styles.formHeader}>
          <FaSignInAlt className={styles.headerIcon} />
          <h2 className={styles.loginTitle}>Acessar Conta</h2>
        </header>

        <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="cpf" className={styles.formLabel}>CPF</label>
            <input
              id="cpf"
              ref={cpfInputRef}
              type="text"
              name="cpf"
              placeholder="Digite seu CPF"
              className={`${styles.inputField} ${
                error && (error.toLowerCase().includes("cpf") || error.toLowerCase().includes("usuário") || error.toLowerCase().includes("campos")) ? styles.inputError : ""
              }`}
              value={formattedCpfDisplay}
              onChange={handleCpfInputChange}
              disabled={loading}
              maxLength={14}
              aria-invalid={error && (error.toLowerCase().includes("cpf") || error.toLowerCase().includes("usuário")) ? "true" : "false"}
              aria-describedby={error ? "errorMessage" : undefined}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Senha</label>
            <input
              id="password"
              ref={passwordRef}
              type="password"
              name="password"
              placeholder="Digite sua senha"
              className={`${styles.inputField} ${
                error && (error.toLowerCase().includes("senha") || error.toLowerCase().includes("campos")) ? styles.inputError : ""
              }`}
              onChange={handlePasswordChange}
              disabled={loading}
              aria-invalid={error && error.toLowerCase().includes("senha") ? "true" : "false"}
              aria-describedby={error ? "errorMessage" : undefined}
            />
          </div>

          {error && (
            <p id="errorMessage" className={styles.errorMessage} role="alert">
              <FaExclamationCircle className={styles.errorIcon} /> {error}
            </p>
          )}

          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnLogin}`}>
            {loading ? "Entrando..." : "Login"}
          </button>
        </form>

        <p className={styles.signupPrompt}>
          Não tem uma conta?{" "}
          <Link to="/cadastro" className={styles.signupLink}>
            <FaUserPlus className={styles.linkIcon}/> Cadastre-se aqui!
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
