import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../services/api.js";
import styles from "./OpcoesAgendamento.module.css";
import useScrollEnabled from '../../../hooks/useScrollEnable.jsx';
import { FaCalendarAlt, FaBan, FaSyncAlt, FaArrowLeft, FaSpinner } from "react-icons/fa";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    return "Data Inválida";
  }
  return date.toLocaleDateString("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  return timeString.slice(0, 5);
};

function OpcoesAgendamento() {
  const { id_agendamento } = useParams();
  const navigate = useNavigate();

  const [agendamento, setAgendamento] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [novaData, setNovaData] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [loadingRenovar, setLoadingRenovar] = useState(false);
  const [loadingCancelar, setLoadingCancelar] = useState(false);

  // Restaurado para a lógica original: scroll é habilitado quando os dados carregam e o agendamento existe.
  useScrollEnabled(!loadingData && agendamento !== null);

  useEffect(() => {
    async function fetchAgendamento() {
      setLoadingData(true);
      setErrorMessage("");
      setSuccessMessage("");
      try {
        const { data } = await api.get(`/agendamentos/${id_agendamento}`);
        setAgendamento(data);
        // Define a nova data apenas se o status for concluído
        if (data.status?.toLowerCase() === "concluído") {
          setNovaData(getMinDateForRenewal(data.data));
        }
      } catch (err) {
        setErrorMessage(
          err.response?.data?.detail || "Erro ao carregar os dados do agendamento."
        );
        setAgendamento(null);
      } finally {
        setLoadingData(false);
      }
    }
    fetchAgendamento();
  }, [id_agendamento]);

  const handleCancelar = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoadingCancelar(true);
    try {
      await api.put(`/agendamentos/cancelar/${id_agendamento}`);
      setSuccessMessage("Agendamento cancelado com sucesso!");
      setAgendamento(prev => ({ ...prev, status: "Cancelado" }));
      setTimeout(() => navigate("/listar"), 2500);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Erro ao cancelar o agendamento.");
    } finally {
      setLoadingCancelar(false);
    }
  };

  const handleRenovar = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!novaData) {
      setErrorMessage("Por favor, selecione uma nova data para renovação.");
      return;
    }
    if (agendamento && agendamento.data === novaData) {
        setErrorMessage("A nova data não pode ser igual à data atual do agendamento.");
        return;
    }
    setLoadingRenovar(true);
    try {
      await api.post(`/agendamentos/renovar/${id_agendamento}`, { nova_data: novaData });
      setSuccessMessage("Agendamento renovado com sucesso!");
      // Atualiza o agendamento para refletir a renovação
      setAgendamento(prev => ({ ...prev, status: "Renovado", data: novaData }));
      setTimeout(() => navigate("/listar"), 2500);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Erro ao renovar o agendamento.");
    } finally {
      setLoadingRenovar(false);
    }
  };

  const getMinDateForRenewal = (currentAgendamentoDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let minAllowedDate = today;

    if (currentAgendamentoDate) {
        const agendamentoDate = new Date(currentAgendamentoDate + 'T00:00:00');

        if (!isNaN(agendamentoDate.getTime())) {
            if (agendamentoDate >= today) {
                const dayAfterAgendamento = new Date(agendamentoDate.getTime() + 24 * 60 * 60 * 1000);
                dayAfterAgendamento.setHours(0, 0, 0, 0);
                minAllowedDate = dayAfterAgendamento;
            }
        }
    }
    return minAllowedDate.toISOString().split("T")[0];
  };

  if (loadingData) {
    return (
      <div className={styles.pageWrapper}>
        <p className={`${styles.feedbackMessage} ${styles.loadingMessage}`}>
          <FaSpinner className={styles.spinnerIcon} /> Carregando detalhes do agendamento...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.appointmentCard}>
        <h1 className={styles.cardHeader}>Detalhes do Agendamento</h1>

        {errorMessage && (
          <p className={`${styles.feedbackMessage} ${styles.messageError}`} role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className={`${styles.feedbackMessage} ${styles.messageSuccess}`} role="alert">
            {successMessage}
          </p>
        )}

        {!agendamento && !errorMessage && !loadingData && (
             <p className={`${styles.feedbackMessage} ${styles.messageInfo}`}>
                Nenhum detalhe de agendamento encontrado para este ID.
            </p>
        )}

        {agendamento && (
          <div className={styles.cardContent}>
            {/* Logs para depuração do status */}
            {console.log('Status do agendamento (bruto):', agendamento.status)}
            {console.log('Status do agendamento (toLowerCase):', agendamento.status?.toLowerCase())}
            {console.log('Condição "concluído" satisfeita?', agendamento.status?.toLowerCase() === "concluído")}
            {console.log('Seção de ações visível?', agendamento.status?.toLowerCase() !== "cancelado" && agendamento.status?.toLowerCase() !== "renovado")}

            <div className={styles.detailSection}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Quadra</span>
                <span className={styles.detailValue}>{agendamento.nome_quadra || "N/A"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data</span>
                <span className={styles.detailValue}>{formatDate(agendamento.data)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Início</span>
                <span className={styles.detailValue}>{formatTime(agendamento.horario_inicio)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fim</span>
                <span className={styles.detailValue}>{formatTime(agendamento.horario_fim)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span className={`${styles.statusPill} ${styles[agendamento.status?.toLowerCase().replace(/\s+/g, '') || 'default']}`}>
                  {agendamento.status || "N/A"}
                </span>
              </div>
            </div>

            {agendamento.status?.toLowerCase() !== "cancelado" && agendamento.status?.toLowerCase() !== "renovado" && (
                <div className={styles.actionSection}>
                    <h2 className={styles.actionHeader}>Opções do Agendamento</h2>

                    {agendamento.status?.toLowerCase() === "concluido" && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="novaData" className={styles.inputLabel}>
                                <FaCalendarAlt /> Nova Data de Renovação:
                            </label>
                            <input
                                type="date"
                                id="novaData"
                                value={novaData}
                                onChange={(e) => setNovaData(e.target.value)}
                                min={getMinDateForRenewal(agendamento.data)}
                                disabled={loadingRenovar || loadingCancelar || !!successMessage}
                                className={styles.dateInputField}
                                aria-describedby="dataHelp"
                            />
                            <small id="dataHelp" className={styles.helpText}>
                                Selecione a nova data para o agendamento.
                            </small>
                        </div>
                    )}

                    <div className={styles.buttonContainer}>
                        {(agendamento.status?.toLowerCase() === "agendado" || agendamento.status?.toLowerCase() === "confirmado") && (
                            <button
                                onClick={handleCancelar}
                                className={`${styles.actionButton} ${styles.buttonDanger}`}
                                disabled={loadingCancelar || loadingRenovar || !!successMessage}
                                aria-disabled={loadingCancelar || loadingRenovar || !!successMessage}
                            >
                                <FaBan /> {loadingCancelar ? "Cancelando..." : "Cancelar Agendamento"}
                            </button>
                        )}

                        {agendamento.status?.toLowerCase() === "concluido" && (
                            <button
                                onClick={handleRenovar}
                                className={`${styles.actionButton} ${styles.buttonPrimary}`}
                                disabled={loadingRenovar || loadingCancelar || !novaData || !!successMessage}
                                aria-disabled={loadingRenovar || loadingCancelar || !novaData || !!successMessage}
                            >
                                <FaSyncAlt /> {loadingRenovar ? "Renovando..." : "Renovar Agendamento"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.navigationSection}>
                <button
                    onClick={() => navigate("/listar")}
                    className={`${styles.actionButton} ${styles.buttonSecondary}`}
                    disabled={loadingRenovar || loadingCancelar}
                >
                    <FaArrowLeft /> Voltar para Lista
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OpcoesAgendamento;