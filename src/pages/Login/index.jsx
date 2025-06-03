import { useRef, useState, useEffect } from "react";
import { parseISO } from 'date-fns';
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import styles from "./login.module.css";
import { FaSignInAlt, FaUserPlus, FaExclamationCircle, FaArrowLeft, FaKey, FaEnvelope, FaIdCard, FaTimes, FaCheckCircle } from "react-icons/fa";

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

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordCpf, setForgotPasswordCpf] = useState("");
  const [forgotPasswordFormattedCpf, setForgotPasswordFormattedCpf] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState({ type: "", text: "" });
  const forgotCpfInputRef = useRef(null);
  const forgotEmailInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expirationString = localStorage.getItem("token_expiration");

    if (token && expirationString) {
      const expirationTimestamp = Number(expirationString);
      if (!isNaN(expirationTimestamp) && Date.now() < expirationTimestamp) {
        navigate("/home");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("token_expiration");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (showForgotPasswordModal) {
      forgotCpfInputRef.current?.focus();
    } else {
      cpfInputRef.current?.focus();
    }
  }, [showForgotPasswordModal]);

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
      const expirationDateString = data.exp;
      const dateObject = parseISO(expirationDateString);
      const expirationTimestampMillis = dateObject.getTime();
      localStorage.setItem("token_expiration", expirationTimestampMillis.toString());

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

  const openForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
    setForgotPasswordMessage({ type: "", text: "" });
    setForgotPasswordCpf("");
    setForgotPasswordFormattedCpf("");
    setForgotPasswordEmail("");
    setError("");
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  const handleForgotPasswordCpfChange = (e) => {
    const inputValue = e.target.value;
    const currentRawDigits = inputValue.replace(/\D/g, "");
    if (currentRawDigits.length <= 11) {
      setForgotPasswordCpf(currentRawDigits);
      setForgotPasswordFormattedCpf(formatCpfDisplay(currentRawDigits));
    }
    if (forgotPasswordMessage.text) setForgotPasswordMessage({ type: "", text: "" });
  };

  const handleForgotPasswordEmailChange = (e) => {
    setForgotPasswordEmail(e.target.value);
    if (forgotPasswordMessage.text) setForgotPasswordMessage({ type: "", text: "" });
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    setForgotPasswordMessage({ type: "", text: "" });

    if (!forgotPasswordCpf || !forgotPasswordEmail) {
      setForgotPasswordMessage({ type: "error", text: "CPF e E-mail são obrigatórios." });
      return;
    }
    if (forgotPasswordCpf.length !== 11) {
      setForgotPasswordMessage({ type: "error", text: "CPF inválido. Deve conter 11 dígitos." });
      forgotCpfInputRef.current?.focus();
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordMessage({ type: "error", text: "Formato de e-mail inválido." });
      forgotEmailInputRef.current?.focus();
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await api.post("/usuario/redefinir-senha", {
        cpf: forgotPasswordCpf,
        email: forgotPasswordEmail,
      });
      setForgotPasswordMessage({ type: "success", text: response.data.detail || "Solicitação enviada! Se os dados estiverem corretos, um e-mail de recuperação será enviado." });
      setForgotPasswordCpf("");
      setForgotPasswordFormattedCpf("");
      setForgotPasswordEmail("");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Erro ao solicitar redefinição. Tente novamente.";
      setForgotPasswordMessage({ type: "error", text: errorMsg });
      if (errorMsg.toLowerCase().includes("cpf")) forgotCpfInputRef.current?.focus();
      else if (errorMsg.toLowerCase().includes("email") || errorMsg.toLowerCase().includes("e-mail")) forgotEmailInputRef.current?.focus();
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <>
      <div className={styles.pageWrapper}>
        <div className={styles.loginContainer}>
          <Link to="/" className={styles.backLink}>
            <FaArrowLeft className={styles.backIcon} />
            Voltar para o Início
          </Link>
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
                placeholder="000.000.000-00"
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
            
            <div className={styles.actionsRow}>
                <button
                    type="button"
                    className={styles.forgotPasswordLink}
                    onClick={openForgotPasswordModal}
                    disabled={loading}
                >
                    Esqueceu a senha?
                </button>
            </div>

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

      {showForgotPasswordModal && (
        <div className={styles.modalOverlay} onClick={closeForgotPasswordModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={closeForgotPasswordModal} aria-label="Fechar modal">
              <FaTimes />
            </button>
            <FaKey className={styles.modalHeaderIcon} />
            <h2 className={styles.modalTitle}>Recuperar Senha</h2>
            <p className={styles.modalSubtitle}>Informe seu CPF e e-mail para enviarmos um link de recuperação.</p>
            
            <form className={styles.modalForm} onSubmit={handleForgotPasswordSubmit} noValidate>
              <div className={styles.formGroup}>
                <label htmlFor="forgot-cpf" className={styles.formLabel}><FaIdCard /> CPF</label>
                <input
                  id="forgot-cpf"
                  ref={forgotCpfInputRef}
                  type="text"
                  placeholder="000.000.000-00"
                  value={forgotPasswordFormattedCpf}
                  onChange={handleForgotPasswordCpfChange}
                  className={`${styles.inputField} ${forgotPasswordMessage.type === 'error' && (forgotPasswordMessage.text.toLowerCase().includes("cpf") || forgotPasswordMessage.text.toLowerCase().includes("obrigatórios")) ? styles.inputError : ""}`}
                  disabled={forgotPasswordLoading}
                  maxLength={14}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="forgot-email" className={styles.formLabel}><FaEnvelope/> E-mail</label>
                <input
                  id="forgot-email"
                  ref={forgotEmailInputRef}
                  type="email"
                  placeholder="seu@email.com"
                  value={forgotPasswordEmail}
                  onChange={handleForgotPasswordEmailChange}
                  className={`${styles.inputField} ${forgotPasswordMessage.type === 'error' && (forgotPasswordMessage.text.toLowerCase().includes("e-mail") || forgotPasswordMessage.text.toLowerCase().includes("obrigatórios")) ? styles.inputError : ""}`}
                  disabled={forgotPasswordLoading}
                />
              </div>

              {forgotPasswordMessage.text && (
                <p className={`${styles.modalMessage} ${forgotPasswordMessage.type === 'success' ? styles.modalMessageSuccess : styles.modalMessageError}`}>
                  {forgotPasswordMessage.type === 'success' && <FaCheckCircle className={styles.successIconModal} />}
                  {forgotPasswordMessage.type === 'error' && <FaExclamationCircle className={styles.errorIconModal} />}
                  {forgotPasswordMessage.text}
                </p>
              )}

              <button type="submit" className={`${styles.btn} ${styles.btnModalSubmit}`} disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? "Enviando..." : "Enviar Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;