import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './resetPasswordConfirmPage.module.css';
import { FaKey, FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

function ResetPasswordConfirmPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const newPasswordRef = useRef(null);
  const redirectTimerId = useRef(null);

  useEffect(() => {
    newPasswordRef.current?.focus();
    return () => {
      if (redirectTimerId.current) {
        clearTimeout(redirectTimerId.current);
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha ambos os campos de senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      setError('Senha insegura. Use pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/usuario/validar-nova-senha/${token}`, {
        nova_senha: newPassword,
      });
      setSuccessMessage(response.data.detail || 'Senha redefinida com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      redirectTimerId.current = setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao redefinir a senha. O link pode ter expirado ou ser inválido.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (redirectTimerId.current) {
      clearTimeout(redirectTimerId.current);
    }
    navigate('/login');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.resetContainer}>
        <Link to="/login" className={styles.backToLoginLink}>
          <FaArrowLeft className={styles.backIcon} />
          Voltar para o Login
        </Link>
        <header className={styles.formHeader}>
          <FaKey className={styles.headerIcon} />
          <h2 className={styles.pageTitle}>Redefinir Senha</h2>
        </header>

        {!successMessage ? (
          <form className={styles.resetForm} onSubmit={handleSubmit} noValidate>
            <p className={styles.instructions}>
              Crie uma nova senha para sua conta. Ela deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
            </p>
            <div className={styles.formGroup}>
              <label htmlFor="new-password" className={styles.formLabel}>Nova Senha</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="new-password"
                  ref={newPasswordRef}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Digite sua nova senha"
                  className={`${styles.inputField} ${error && (error.toLowerCase().includes("senha") || error.toLowerCase().includes("ambos") || error.toLowerCase().includes("insegura")) ? styles.inputError : ""}`}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordVisibilityToggle} aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirm-password" className={styles.formLabel}>Confirmar Nova Senha</label>
               <div className={styles.passwordInputWrapper}>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Confirme sua nova senha"
                  className={`${styles.inputField} ${error && (error.toLowerCase().includes("senha") || error.toLowerCase().includes("ambos") || error.toLowerCase().includes("coincidem")) ? styles.inputError : ""}`}
                  disabled={loading}
                />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.passwordVisibilityToggle} aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <p className={styles.errorMessageDisplay}>
                <FaExclamationCircle className={styles.errorIcon} /> {error}
              </p>
            )}

            <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        ) : (
          <div className={styles.successMessageDisplay}>
            <FaCheckCircle className={styles.successIcon} />
            <h3>{successMessage}</h3>
            <p className={styles.successDetail}>Sua senha foi alterada com segurança.</p>
            <button
              className={`${styles.btn} ${styles.btnGoToLogin}`}
              onClick={handleGoToLogin}
            >
              Ir para Login
            </button>
            <p className={styles.redirectNotice}>
              Você também será redirecionado automaticamente em alguns segundos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordConfirmPage;