import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import styles from "./cadastro.module.css";
import { FaUserPlus, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from "react-icons/fa";

const formatCpfDisplay = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11); 

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};


function Cadastro() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const cpfInputRef = useRef(null);
  const passwordRef = useRef(null);

  const [rawCpfValue, setRawCpfValue] = useState(""); 
  const [formattedCpfDisplay, setFormattedCpfDisplay] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Cadastrar");

  const navigate = useNavigate();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const clearErrorOnChange = () => {
    if (error) setError("");
  };

  const handleCpfInputChange = (e) => {
    clearErrorOnChange();
    const inputValue = e.target.value;
    const currentRawDigits = inputValue.replace(/\D/g, "");

    if (currentRawDigits.length <= 11) {
      setRawCpfValue(currentRawDigits);
      setFormattedCpfDisplay(formatCpfDisplay(currentRawDigits));
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nome = nameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const cpf = rawCpfValue.trim();
    const senha = passwordRef.current.value.trim();

    if (!nome || !email || !cpf || !senha) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    if (cpf.length !== 11) {
      setError("CPF inválido. Deve conter 11 dígitos numéricos.");
      cpfInputRef.current?.focus();
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Formato de e-mail inválido.");
        emailRef.current?.focus();
        return;
    }
    if (senha.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        passwordRef.current?.focus();
        return;
    }

    setLoading(true);
    setButtonLabel("Cadastrando...");

    try {
      await api.post("/usuario/cadastrar", {
        nome,
        email,
        cpf, 
        senha,
      });

      setButtonLabel("✓ Cadastrado!");
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 800);

      nameRef.current.value = "";
      emailRef.current.value = "";
      setRawCpfValue("");
      setFormattedCpfDisplay("");
      passwordRef.current.value = "";

    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        "Erro ao tentar realizar o cadastro. Verifique os dados ou tente mais tarde.";
      setError(errorMessage);
      setButtonLabel("Cadastrar");
      if (errorMessage.toLowerCase().includes("cpf")) cpfInputRef.current?.focus();
      else if (errorMessage.toLowerCase().includes("email")) emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleCloseModal() {
    setShowSuccessModal(false);
    setButtonLabel("Cadastrar");
    navigate("/login");
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.cadastroContainer}>
        <header className={styles.formHeader}>
          <FaUserPlus className={styles.headerIcon} />
          <h2 className={styles.cadastroTitle}>Criar Nova Conta</h2>
        </header>

        <form className={styles.cadastroForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="nome" className={styles.formLabel}>Nome Completo</label>
            <input
              id="nome"
              ref={nameRef}
              type="text"
              placeholder="Seu nome completo"
              required
              disabled={loading}
              className={`${styles.inputField} ${error && error.toLowerCase().includes("nome") ? styles.inputError : ""}`}
              onChange={clearErrorOnChange}
              aria-invalid={error && error.toLowerCase().includes("nome") ? "true" : "false"}
              aria-describedby={error ? "errorMessage" : undefined}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>E-mail</label>
            <input
              id="email"
              ref={emailRef}
              type="email"
              placeholder="seu@email.com"
              required
              disabled={loading}
              className={`${styles.inputField} ${error && error.toLowerCase().includes("email") ? styles.inputError : ""}`}
              onChange={clearErrorOnChange}
              aria-invalid={error && error.toLowerCase().includes("email") ? "true" : "false"}
              aria-describedby={error ? "errorMessage" : undefined}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf" className={styles.formLabel}>CPF</label>
            <input
              id="cpf"
              ref={cpfInputRef}
              type="text" 
              placeholder="000.000.000-00"
              required
              disabled={loading}
              className={`${styles.inputField} ${error && error.toLowerCase().includes("cpf") ? styles.inputError : ""}`}
              value={formattedCpfDisplay}
              onChange={handleCpfInputChange}
              maxLength={14}
              aria-invalid={error && error.toLowerCase().includes("cpf") ? "true" : "false"}
              aria-describedby={error ? "errorMessage" : undefined}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="senha" className={styles.formLabel}>Senha</label>
            <input
              id="senha"
              ref={passwordRef}
              type="password"
              placeholder="Crie uma senha (mín. 6 caracteres)"
              required
              disabled={loading}
              className={`${styles.inputField} ${error && error.toLowerCase().includes("senha") ? styles.inputError : ""}`}
              onChange={clearErrorOnChange}
              minLength={6}
              aria-invalid={error && error.toLowerCase().includes("senha") ? "true" : "false"}
              aria-describedby={error ? "errorMessage" : undefined}
            />
          </div>


          {error && (
            <p id="errorMessage" role="alert" className={styles.errorMessage}>
              <FaExclamationCircle className={styles.errorIcon} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || buttonLabel === "✓ Cadastrado!"}
            className={`${styles.btn} ${styles.btnSubmit} ${buttonLabel === "✓ Cadastrado!" ? styles.btnSuccessState : ""}`}
          >
            {buttonLabel}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          Já possui uma conta?{" "}
          <Link to="/login" className={styles.loginLink}>
             <FaArrowLeft className={styles.linkIcon}/> Faça Login
          </Link>
        </p>
      </div>

      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <FaCheckCircle className={styles.modalIconSuccess} />
            <h2 className={styles.modalTitle}>Cadastro realizado com sucesso!</h2>
            <p className={styles.modalText}>
              Sua conta foi criada. Você já pode fazer login.
            </p>
            <button
              className={`${styles.btn} ${styles.btnModalConfirm}`}
              onClick={handleCloseModal}
              autoFocus
            >
              Ir para Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cadastro;