// src/components/AgendarQuadra/AgendarQuadra.js
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../../../services/api";
import styles from "./AgendarQuadra.module.css";
import useScrollEnabled from '../../../hooks/useScrollEnable.jsx'; 
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaChevronLeft } from "react-icons/fa";

function AgendarQuadra() {
  const location = useLocation();
  const navigate = useNavigate();

  const [quadras, setQuadras] = useState([]);
  const [formData, setFormData] = useState({
    id_quadra: "",
    data: "",
    horariosSelecionados: [],
  });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  const [loadingQuadras, setLoadingQuadras] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useScrollEnabled(!loadingHorarios && horariosDisponiveis.length > 0);

  const formatErrorMessage = (error) => {
    let detailedMessage = "Ocorreu um erro. Tente novamente.";
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        detailedMessage = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail) && error.response.data.detail.length > 0) {
        detailedMessage = error.response.data.detail.map(err => `${err.loc ? err.loc.join('->') : 'Campo'}: ${err.msg}`).join('; ');
      } else if (typeof error.response.data.detail === 'object' && error.response.data.detail.msg) {
          detailedMessage = error.response.data.detail.msg;
      }
    } else if (error.message) {
        detailedMessage = error.message;
    }
    return detailedMessage;
  };

  useEffect(() => {
    async function loadAndPreselectQuadras() {
      setLoadingQuadras(true);
      setErrorMessage("");
      const idFromLinkState = location.state?.idQuadraSelecionada;

      try {
        const response = await api.get("/quadras/listar-quadras");
        const quadrasDaApi = (response.data.quadras || response.data || [])
          .map((q, index) => {
            const apiId = q.id_quadra || q.id;
            let idForSelectValue = null;
            if (apiId !== null && apiId !== undefined) {
              const parsedId = parseInt(apiId, 10);
              if (!isNaN(parsedId)) {
                idForSelectValue = String(parsedId);
              }
            }
            return {
              ...q,
              id_value_select: idForSelectValue,
              key_react: idForSelectValue || `quadra-key-${index}`
            };
          })
          .filter(q => q.id_value_select !== null);

        setQuadras(quadrasDaApi);

        let idParaPreencherNoForm = "";
        if (idFromLinkState) {
          const quadraEncontrada = quadrasDaApi.find(q => q.id_value_select === idFromLinkState);
          if (quadraEncontrada) {
            idParaPreencherNoForm = quadraEncontrada.id_value_select;
          } else {
            console.warn("AgendarQuadra.js: ID da quadra do link não encontrado:", idFromLinkState);
          }
        }

        if (formData.id_quadra !== idParaPreencherNoForm) {
            setFormData(prev => ({
              ...prev,
              id_quadra: idParaPreencherNoForm,
              data: "",
              horariosSelecionados: []
            }));
        }

      } catch (error) {
        setErrorMessage(formatErrorMessage(error));
        setQuadras([]);
        setFormData({ id_quadra: "", data: "", horariosSelecionados: [] });
      } finally {
        setLoadingQuadras(false);
      }
    }
    loadAndPreselectQuadras();
  }, [location.state]);

  useEffect(() => {
    async function carregarHorariosDisponiveis() {
      const idQuadraNumerico = parseInt(formData.id_quadra, 10);

      if (!formData.id_quadra || !formData.data || isNaN(idQuadraNumerico)) {
        setHorariosDisponiveis([]);
        return;
      }

      setFormData(prev => ({ ...prev, horariosSelecionados: [] }));
      setLoadingHorarios(true);
      setHorariosDisponiveis([]);
      setErrorMessage("");

      try {
        const { data: horariosData } = await api.get("/quadras/horarios-disponiveis", {
          params: { id_quadra: idQuadraNumerico, data: formData.data },
          
        });
        setHorariosDisponiveis(horariosData || []);
      } catch (error) {
        setErrorMessage(formatErrorMessage(error));
        setHorariosDisponiveis([]);
      } finally {
        setLoadingHorarios(false);
      }
    }
    carregarHorariosDisponiveis();
  }, [formData.id_quadra, formData.data]);

  function handleChange(e) {
    const { name, value } = e.target;
    setErrorMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function toggleHorario(horarioParaAlternar) {
    setErrorMessage("");
    setFormData((prev) => {
      let novosSelecionados = [...prev.horariosSelecionados];
      const index = novosSelecionados.findIndex(h => h.inicio === horarioParaAlternar.inicio);

      if (index > -1) {
        novosSelecionados.splice(index, 1);
      } else {
        novosSelecionados.sort((a, b) => (a.inicio > b.inicio ? 1 : -1));
        const primeiro = novosSelecionados[0];
        const ultimo = novosSelecionados[novosSelecionados.length - 1];

        if (novosSelecionados.length === 0) {
          novosSelecionados.push(horarioParaAlternar);
        } else if (horarioParaAlternar.inicio === ultimo.fim) {
          novosSelecionados.push(horarioParaAlternar);
        } else if (horarioParaAlternar.fim === primeiro.inicio) {
          novosSelecionados.unshift(horarioParaAlternar);
        } else {
          novosSelecionados = [horarioParaAlternar];
        }
      }
      novosSelecionados.sort((a, b) => (a.inicio > b.inicio ? 1 : -1));
      return { ...prev, horariosSelecionados: novosSelecionados };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.id_quadra) { setErrorMessage("Por favor, selecione uma quadra."); return; }
    if (!formData.data) { setErrorMessage("Por favor, selecione uma data."); return; }
    if (formData.horariosSelecionados.length === 0) { setErrorMessage("Por favor, selecione ao menos um horário."); return; }

    const idQuadraNumerico = parseInt(formData.id_quadra, 10);
    if (isNaN(idQuadraNumerico)) { setErrorMessage("ID da quadra inválido."); return; }

    const horario_inicio = formData.horariosSelecionados[0].inicio;
    const horario_fim = formData.horariosSelecionados[formData.horariosSelecionados.length - 1].fim;

    setLoadingSubmit(true);
    try {
      await api.post("/agendamentos/agendar-quadra", {
        id_quadra: idQuadraNumerico,
        data: formData.data,
        horario_inicio,
        horario_fim,
      });
      setShowSuccessModal(true);
      setFormData({ id_quadra: "", data: "", horariosSelecionados: [] });
      setHorariosDisponiveis([]);
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
    } finally {
      setLoadingSubmit(false);
    }
  }

  function handleCloseModal() {
    setShowSuccessModal(false);
    navigate("/listar");
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <header className={styles.formHeader}>
          <h2 className={styles.formTitle}>Agendar Quadra</h2>
        </header>

        <form onSubmit={handleSubmit} className={styles.agendarForm} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="id_quadra" className={styles.formLabel}>Quadra:</label>
              <select
                id="id_quadra" name="id_quadra" value={formData.id_quadra}
                onChange={handleChange} required className={styles.formSelect}
                disabled={loadingQuadras}
              >
                <option value="">{loadingQuadras ? "Carregando..." : "Selecione uma quadra"}</option>
                {quadras.map((q) => (
                  <option
                    key={q.key_react}
                    value={q.id_value_select}
                    title={`${q.nome_quadra} (${q.esporte})`}
                  >
                    {q.nome_quadra} ({q.esporte})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="data" className={styles.formLabel}>
                <FaCalendarAlt className={styles.labelIcon} /> Data:
              </label>
              <input
                type="date" id="data" name="data" value={formData.data}
                onChange={handleChange} min={today} required className={styles.formInput}
                disabled={!formData.id_quadra || loadingQuadras}
              />
            </div>
          </div>

          <div className={styles.horariosSection} aria-live="polite">
            <h3 className={styles.horariosTitle} id="horarios-label">
              <FaClock className={styles.labelIcon} /> Horários Disponíveis
            </h3>
            {loadingHorarios && <p className={styles.infoMessage}>Buscando horários...</p>}
            {!loadingHorarios && !formData.id_quadra && <p className={styles.infoMessage}>Selecione uma quadra.</p>}
            {!loadingHorarios && formData.id_quadra && !formData.data && <p className={styles.infoMessage}>Selecione uma data.</p>}
            {!loadingHorarios && formData.id_quadra && formData.data && horariosDisponiveis.length === 0 && !errorMessage &&
              <p className={styles.infoMessage}>Nenhum horário disponível.</p>}

            {horariosDisponiveis.length > 0 && !loadingHorarios && (
              <>
                <p className={styles.instrucaoHorarios}>Selecione horários consecutivos.</p>
                <div className={styles.botoesHorarios} role="group" aria-labelledby="horarios-label">
                  {horariosDisponiveis.map((horario, index) => {
                    const isSelecionado = formData.horariosSelecionados.some(h => h.inicio === horario.inicio);
                    return (
                      <button
                        key={horario.id_horario_disponivel || `${horario.inicio}-${index}`}
                        type="button"
                        className={`${styles.btnHorario} ${isSelecionado ? styles.selected : ""}`}
                        onClick={() => toggleHorario(horario)}
                        aria-pressed={isSelecionado}
                      >
                        {horario.inicio.slice(0, 5)} - {horario.fim.slice(0, 5)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {formData.horariosSelecionados.length > 0 && (
            <p className={styles.horarioSelecionadoDisplay}>
              <strong>Horário Escolhido:</strong>{' '}
              {formData.horariosSelecionados[0].inicio.slice(0, 5)} -{' '}
              {formData.horariosSelecionados[formData.horariosSelecionados.length - 1].fim.slice(0, 5)}
            </p>
          )}

          {errorMessage && (
            <div className={styles.errorMessage} role="alert" aria-live="assertive">
              <FaTimesCircle className={styles.errorIcon} /> {errorMessage}
            </div>
          )}

          <div className={styles.formActions}>
            <Link to="/listar" className={`${styles.btn} ${styles.btnSecondary}`}>
              <FaChevronLeft /> Voltar
            </Link>
            <button
              type="submit"
              disabled={loadingSubmit || !formData.id_quadra || !formData.data || formData.horariosSelecionados.length === 0}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              {loadingSubmit ? "Agendando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <FaCheckCircle className={styles.modalIconSuccess} />
            <h2 className={styles.modalTitle}>Agendamento realizado!</h2>
            <p className={styles.modalText}>Seu horário foi confirmado.</p>
            <button
              className={`${styles.btn} ${styles.btnModalConfirm}`}
              onClick={handleCloseModal}
              autoFocus
            >
              Ok, Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendarQuadra;