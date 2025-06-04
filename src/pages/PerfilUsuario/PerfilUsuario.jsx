import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import styles from "./perfilUsuario.module.css";
import useScrollEnabled from '../../hooks/useScrollEnable';

import {
  FaUserCircle, FaEnvelope, FaIdCard, FaEdit, FaSave, FaTimes,
  FaSpinner, FaTimesCircle, FaArrowLeft, FaCheckCircle
} from "react-icons/fa";

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateName = (name) => {
  return name.trim().length >= 3;
};

const formatCpf = (cpf) => {
  if (!cpf) return '';
  const cleanCpf = String(cpf).replace(/\D/g, '');
  if (cleanCpf.length !== 11) {
    return cleanCpf;
  }
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

function UserProfile() {
  useScrollEnabled();

  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    cpf: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [originalName, setOriginalName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [isValidName, setIsValidName] = useState(true);
  const [isValidEmail, setIsValidEmail] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError(null);
      setSuccessMessage("");
      try {
        const response = await api.get("/usuario-info/");
        const data = response.data;
        setUserData(data);
        setOriginalName(data.nome);
        setOriginalEmail(data.email);
        setIsValidName(validateName(data.nome));
        setIsValidEmail(validateEmail(data.email));
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
        setError("Não foi possível carregar suas informações. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'nome') {
      setIsValidName(validateName(value));
    } else if (name === 'email') {
      setIsValidEmail(validateEmail(value));
    }
  };

  const handleEditField = (fieldName) => {
    setError(null);
    setSuccessMessage("");
    if (fieldName === 'nome') {
      setIsEditingName(true);
      setIsValidName(validateName(userData.nome));
    } else if (fieldName === 'email') {
      setIsEditingEmail(true);
      setIsValidEmail(validateEmail(userData.email));
    }
  };

  const handleCancelField = (fieldName) => {
    setError(null);
    setSuccessMessage("");
    if (fieldName === 'nome') {
      setUserData((prevData) => ({ ...prevData, nome: originalName }));
      setIsEditingName(false);
      setIsValidName(true);
    } else if (fieldName === 'email') {
      setUserData((prevData) => ({ ...prevData, email: originalEmail }));
      setIsEditingEmail(false);
      setIsValidEmail(true);
    }
  };

  const handleSaveField = async (fieldName) => {
    setError(null);
    setSuccessMessage("");
    let isSuccess = false;

    if (fieldName === 'nome') {
      if (!isValidName) {
        setError("Por favor, insira um nome válido (mínimo 3 caracteres).");
        return;
      }
      if (userData.nome === originalName) {
        setIsEditingName(false);
        return;
      }
    }
    if (fieldName === 'email') {
      if (!isValidEmail) {
        setError("Por favor, insira um e-mail válido.");
        return;
      }
      if (userData.email === originalEmail) {
        setIsEditingEmail(false);
        return;
      }
    }

    try {
      if (fieldName === 'nome') {
        setSavingName(true);
        const payload = { nome: userData.nome };
        await api.post("/usuario-info/alterar-nome", payload);
        setOriginalName(userData.nome);
        setIsEditingName(false);
        isSuccess = true;
      } else if (fieldName === 'email') {
        setSavingEmail(true);
        const payload = { email: userData.email };
        await api.post("/usuario-info/alterar-email", payload);
        setOriginalEmail(userData.email);
        setIsEditingEmail(false);
        isSuccess = true;
      }

      if (isSuccess) {
        setSuccessMessage(`Seu ${fieldName} foi atualizado com sucesso!`);
      }

    } catch (err) {
      console.error(`Erro ao salvar ${fieldName}:`, err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(`Não foi possível salvar o ${fieldName}. Verifique os dados e tente novamente.`);
      }
      if (fieldName === 'nome') setIsEditingName(true);
      if (fieldName === 'email') setIsEditingEmail(true);
    } finally {
      if (fieldName === 'nome') setSavingName(false);
      if (fieldName === 'email') setSavingEmail(false);
    }
  };

  if (loading && !userData.nome && !error) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.feedbackContainer}>
          <FaSpinner className={`${styles.feedbackIcon} ${styles.spinner}`} />
          <p className={styles.feedbackMensagem}>Carregando informações do perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !userData.nome) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.feedbackContainer}>
          <FaTimesCircle className={`${styles.feedbackIcon} ${styles.errorIcon}`} />
          <p className={`${styles.feedbackMensagem} ${styles.errorMessageText}`}>{error}</p>
          <Link to="/home" className={`${styles.btn} ${styles.btnOutline}`}>
            <FaArrowLeft className={styles.btnIcon} /> Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileContainer}>
        <header className={styles.profileHeader}>
          <h2 className={styles.sectionTitle}>Meu Perfil</h2>
        </header>

        {successMessage && (
          <div className={styles.successMessage}>
            <FaCheckCircle className={styles.feedbackMsgIcon} />
            {successMessage}
          </div>
        )}

        {error && (
            <div className={styles.errorMessage}>
                <FaTimesCircle className={styles.feedbackMsgIcon} />
                {error}
            </div>
        )}

        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            <FaUserCircle />
          </div>

          <div className={styles.profileInfoGroup}>
            <div className={`${styles.profileInfoItem} ${isEditingName ? styles.isEditing : ''}`}>
              <label htmlFor="nome" className={styles.infoLabel}>
                <FaUserCircle className={styles.infoIcon} /> Nome:
              </label>
              <div className={styles.fieldContent}>
                <div className={styles.fieldValueWrapper}>
                  {isEditingName ? (
                    <>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={userData.nome}
                        onChange={handleInputChange}
                        className={`${styles.profileInput} ${!isValidName ? styles.isInvalid : (userData.nome !== originalName && isValidName ? styles.isValid : '')}`}
                        autoComplete="name"
                        disabled={savingName}
                      />
                      {userData.nome.length > 0 && (
                        isValidName ? (
                          <FaCheckCircle className={`${styles.validationIcon} ${styles.success}`} />
                        ) : (
                          <FaTimesCircle className={`${styles.validationIcon} ${styles.error}`} />
                        )
                      )}
                    </>
                  ) : (
                    <p className={styles.infoValue}>{userData.nome}</p>
                  )}
                </div>
                <div className={styles.fieldActions}>
                  {isEditingName ? (
                    <>
                      <button
                        onClick={() => handleSaveField('nome')}
                        className={`${styles.iconButton} ${savingName ? styles.btnLoading : ''}`}
                        disabled={savingName || userData.nome === originalName || !isValidName}
                        title="Salvar Nome"
                      >
                        {savingName ? <FaSpinner className={styles.spinnerIcon} /> : <FaSave />}
                      </button>
                      <button
                        onClick={() => handleCancelField('nome')}
                        className={styles.iconButton}
                        disabled={savingName}
                        title="Cancelar Edição"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditField('nome')}
                      className={`${styles.iconButton} ${styles.editButton}`}
                      title="Editar Nome"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`${styles.profileInfoItem} ${isEditingEmail ? styles.isEditing : ''}`}>
              <label htmlFor="email" className={styles.infoLabel}>
                <FaEnvelope className={styles.infoIcon} /> Email:
              </label>
              <div className={styles.fieldContent}>
                <div className={styles.fieldValueWrapper}>
                  {isEditingEmail ? (
                    <>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className={`${styles.profileInput} ${!isValidEmail ? styles.isInvalid : (userData.email !== originalEmail && isValidEmail ? styles.isValid : '')}`}
                        autoComplete="email"
                        disabled={savingEmail}
                      />
                      {userData.email.length > 0 && (
                        isValidEmail ? (
                          <FaCheckCircle className={`${styles.validationIcon} ${styles.success}`} />
                        ) : (
                          <FaTimesCircle className={`${styles.validationIcon} ${styles.error}`} />
                        )
                      )}
                    </>
                  ) : (
                    <p className={styles.infoValue}>{userData.email}</p>
                  )}
                </div>
                <div className={styles.fieldActions}>
                  {isEditingEmail ? (
                    <>
                      <button
                        onClick={() => handleSaveField('email')}
                        className={`${styles.iconButton} ${savingEmail ? styles.btnLoading : ''}`}
                        disabled={savingEmail || userData.email === originalEmail || !isValidEmail}
                        title="Salvar Email"
                      >
                        {savingEmail ? <FaSpinner className={styles.spinnerIcon} /> : <FaSave />}
                      </button>
                      <button
                        onClick={() => handleCancelField('email')}
                        className={styles.iconButton}
                        disabled={savingEmail}
                        title="Cancelar Edição"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditField('email')}
                      className={`${styles.iconButton} ${styles.editButton}`}
                      title="Editar Email"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.profileInfoItem}>
              <label className={styles.infoLabel}>
                <FaIdCard className={styles.infoIcon} /> CPF:
              </label>
              <div className={styles.fieldContent}>
                <div className={styles.fieldValueWrapper}>
                  <p className={`${styles.infoValue} ${styles.readOnlyValue}`}>{formatCpf(userData.cpf)}</p>
                </div>
                <div className={styles.fieldActions}>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionsContainer}>
          <Link to="/home" className={`${styles.btn} ${styles.btnOutline}`}>
            <FaArrowLeft className={styles.btnIcon} /> Voltar para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;