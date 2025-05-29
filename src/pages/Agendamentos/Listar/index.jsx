import { useEffect, useState } from "react";
import { FaArrowLeft, FaPlusCircle, FaSearch, FaFilter } from "react-icons/fa"; 
import { Link } from "react-router-dom";
import api from "../../../services/api.js";
import styles from "./ListarAgendamentos.module.css";

function ListarAgendamentos() {
  const [todosAgendamentos, setTodosAgendamentos] = useState([]); 
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
  const [statusDisponiveis, setStatusDisponiveis] = useState([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [consultaRealizada, setConsultaRealizada] = useState(false); 
  const [selectedStatus, setSelectedStatus] = useState(""); 

  async function loadAgendamentos() {
    setConsultaRealizada(true); 
    setLoading(true);
    setErro("");
    setTodosAgendamentos([]); 
    setStatusDisponiveis([]); 
    try {
      const { data } = await api.get("/agendamentos/");
      const fetchedAgendamentos = data || [];
      setTodosAgendamentos(fetchedAgendamentos);

      const uniqueStatuses = [...new Set(fetchedAgendamentos.filter(a => a.status).map(a => a.status))].sort();
      setStatusDisponiveis(uniqueStatuses);

    } catch (error) {
      if (error.response?.status === 404) {
        setTodosAgendamentos([]);
      } else {
        setErro("Falha ao carregar os agendamentos. Tente novamente mais tarde.");
        console.error("Erro ao buscar agendamentos:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setAgendamentosFiltrados(
      selectedStatus
        ? todosAgendamentos.filter((agendamento) => agendamento.status === selectedStatus)
        : todosAgendamentos
    );
  }, [selectedStatus, todosAgendamentos]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.slice(0, 5);
  };

  const handleConsultarClick = () => {
    loadAgendamentos();
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.listaContainer}>
        <header className={styles.listaHeader}>
          <h2 className={styles.listaTitulo}>Meus Agendamentos</h2>
        </header>

        <div className={styles.filterAndActions}>
          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter" className={styles.filterLabel}>
              <FaFilter className={styles.filterIcon} /> Filtrar por Status:
            </label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={handleStatusChange}
              className={styles.filterSelect}
              disabled={loading}
            >
              <option value="">Todos os Status</option>
              {statusDisponiveis.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleConsultarClick}
            className={`${styles.btn} ${styles.btnConsultar}`}
            disabled={loading}
          >
            <FaSearch className={styles.btnIcon} />
            {loading ? "Consultando..." : "Atualizar Lista"}
          </button>
        </div>

        {!consultaRealizada && !loading && (
          <p className={`${styles.listaMensagem} ${styles.infoMessage}`}>
            Clique em "Atualizar Lista" para ver seus agendamentos.
          </p>
        )}

        {loading && consultaRealizada && (
          <p className={`${styles.listaMensagem} ${styles.loadingMessage}`}>
            Carregando agendamentos...
          </p>
        )}

        {!loading && erro && consultaRealizada && (
          <p className={styles.erroApi} role="alert">
            {erro}
          </p>
        )}

        {!loading && !erro && consultaRealizada && (
          <>
            {agendamentosFiltrados.length > 0 ? (
              <ul className={styles.listaAgendamentos}>
                {agendamentosFiltrados.map((agendamento) => (
                  <li key={agendamento.id_agendamento} className={styles.listaItem}>
                    <div className={styles.itemInfo}>
                      <p><strong>Quadra:</strong> {agendamento.nome_quadra || "N/A"}</p>
                      <p><strong>Usuário:</strong> {agendamento.nome_usuario || "N/A"}</p>
                      <p><strong>Data:</strong> {formatDate(agendamento.data)}</p>
                      <p><strong>Início:</strong> {formatTime(agendamento.horario_inicio)}</p>
                      <p><strong>Fim:</strong> {formatTime(agendamento.horario_fim)}</p>
                      <p><strong>Status:</strong> {agendamento.status || "N/A"}</p>
                    </div>
                    <div className={styles.itemActions}>
                      <Link
                        to={`/agendamento/${agendamento.id_agendamento}/opcoes`}
                        className={`${styles.btn} ${styles.btnOpcoes}`}
                      >
                        Opções
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${styles.listaMensagem} ${styles.listaVazio}`}>
                Nenhum agendamento encontrado {selectedStatus && `para o status "${selectedStatus}"`}.
              </p>
            )}
          </>
        )}

        <footer className={styles.listaFooter}>
          <div className={styles.listaBotoes}>
            <Link to="/home" className={`${styles.btn} ${styles.btnVoltar}`}>
              <FaArrowLeft className={styles.btnIcon} /> Voltar
            </Link>
            <Link to="/agendar" className={`${styles.btn} ${styles.btnAgendar}`}>
              <FaPlusCircle className={styles.btnIcon} /> Agendar Novo
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ListarAgendamentos;