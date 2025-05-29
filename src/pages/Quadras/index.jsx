import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import styles from "./Quadras.module.css";
import useScrollEnabled from '../../hooks/useScrollEnable'; // Verifique o nome correto do arquivo (useScrollEnabled ou useScrollEnable)
import {
  FaMapMarkerAlt, FaInfoCircle, FaCheckCircle, FaTimesCircle,
  FaArrowLeft, FaFilter, FaSpinner,
} from "react-icons/fa";
import { TbLayoutGrid, TbMoodSad } from "react-icons/tb";

function Quadras() {
  const [todasQuadras, setTodasQuadras] = useState([]);
  const [quadrasFiltradas, setQuadrasFiltradas] = useState([]);
  const [esportesDisponiveis, setEsportesDisponiveis] = useState([]);
  const [esporteSelecionado, setEsporteSelecionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useScrollEnabled(); // Habilita a rolagem para esta página

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const responseQuadras = await api.get("/quadras/listar-quadras");
        const quadrasDaApi = (responseQuadras.data.quadras || responseQuadras.data || [])
          .map((q, index) => {
            const apiId = q.id_quadra || q.id;
            let idForLinkParam = null;

            if (apiId !== null && apiId !== undefined) {
              const parsedId = parseInt(apiId, 10);
              if (!isNaN(parsedId)) {
                idForLinkParam = String(parsedId);
              }
            }

            return {
              ...q,
              id_param_para_link: idForLinkParam,
              key_para_react: idForLinkParam || `quadra-idx-${index}`
            };
          });

        setTodasQuadras(quadrasDaApi);
        setQuadrasFiltradas(quadrasDaApi);

        const esportesUnicos = [...new Set(quadrasDaApi.filter(q => q.esporte).map(q => q.esporte))].sort();
        setEsportesDisponiveis(esportesUnicos);

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Não foi possível carregar as quadras. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    setQuadrasFiltradas(
      esporteSelecionado
        ? todasQuadras.filter((quadra) => quadra.esporte === esporteSelecionado)
        : todasQuadras
    );
  }, [esporteSelecionado, todasQuadras]);

  const handleFiltroEsporteChange = (e) => {
    setEsporteSelecionado(e.target.value);
  };

  if (loading) {
    return (
      <div className={styles.feedbackContainer}>
        <FaSpinner className={`${styles.feedbackIcon} ${styles.spinner}`} />
        <p className={styles.feedbackMensagem}>Carregando quadras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.feedbackContainer}>
        <FaTimesCircle className={`${styles.feedbackIcon} ${styles.errorIcon}`} />
        <p className={`${styles.feedbackMensagem} ${styles.errorMessageText}`}>{error}</p>
        <Link to="/home" className={`${styles.btn} ${styles.btnOutline}`}>
          <FaArrowLeft className={styles.btnIcon} /> Voltar para o Início
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.quadrasContainer}>
        <header className={styles.header}>
          <h2 className={styles.sectionTitle}>Nossas Quadras</h2>
          <div className={styles.filtroContainer}>
            <label htmlFor="filtroEsporte" className={styles.filtroLabel}>
              <FaFilter className={styles.filtroIcon} /> Filtrar por Esporte:
            </label>
            <select
              id="filtroEsporte"
              value={esporteSelecionado}
              onChange={handleFiltroEsporteChange}
              className={styles.filtroSelect}
            >
              <option value="">Todos os Esportes</option>
              {esportesDisponiveis.map((esporte, index) => (
                <option key={`${esporte}-${index}`} value={esporte}>
                  {esporte}
                </option>
              ))}
            </select>
          </div>
        </header>

        {quadrasFiltradas.length > 0 ? (
          <div className={styles.quadrasGrid}>
            {quadrasFiltradas.map((quadra) => (
              quadra.id_param_para_link ? (
                <Link
                  to="/agendar"
                  state={{ idQuadraSelecionada: quadra.id_param_para_link, nomeQuadraSelecionada: quadra.nome_quadra }}
                  key={quadra.key_para_react}
                  className={styles.quadraCardLink}
                >
                  <div className={styles.quadraCard}>
                    <div className={styles.cardContent}>
                      <h3 className={styles.quadraNome}>{quadra.nome_quadra}</h3>
                      <p className={styles.quadraInfo}><FaMapMarkerAlt className={styles.cardInfoIcon} /> {quadra.endereco}</p>
                      {quadra.descricao && <p className={styles.quadraInfo}><FaInfoCircle className={styles.cardInfoIcon} /> {quadra.descricao}</p>}
                      <p className={styles.esporteInfo}><TbLayoutGrid className={styles.cardInfoIcon} /> Esporte: <strong>{quadra.esporte}</strong></p>
                    </div>
                    <div className={styles.disponibilidadeContainer}>
                      {quadra.disponibilidade === "S" ? (
                        <span className={`${styles.badge} ${styles.disponivel}`}><FaCheckCircle className={styles.badgeIcon} /> Disponível</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.indisponivel}`}><FaTimesCircle className={styles.badgeIcon} /> Indisponível</span>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div key={quadra.key_para_react} className={`${styles.quadraCard} ${styles.quadraCardDisabled}`}>
                  <div className={styles.cardContent}>
                    <h3 className={styles.quadraNome}>{quadra.nome_quadra}</h3>
                    <p className={styles.quadraInfo}><FaMapMarkerAlt className={styles.cardInfoIcon} /> {quadra.endereco}</p>
                    {quadra.descricao && <p className={styles.quadraInfo}><FaInfoCircle className={styles.cardInfoIcon} /> {quadra.descricao}</p>}
                    <p className={styles.esporteInfo}><TbLayoutGrid className={styles.cardInfoIcon} /> Esporte: <strong>{quadra.esporte}</strong></p>
                  </div>
                  <div className={styles.disponibilidadeContainer}>
                    <span className={`${styles.badge} ${styles.indisponivel}`}><FaTimesCircle className={styles.badgeIcon} /> Agendamento Indisponível</span>
                  </div>
                  <p className={styles.warningMessage}>ID de quadra inválido ou erro de dados.</p>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className={styles.feedbackContainer}>
            <TbMoodSad className={`${styles.feedbackIcon} ${styles.emptyIcon}`} />
            <p className={styles.feedbackMensagem}>
              {esporteSelecionado ? `Nenhuma quadra encontrada para "${esporteSelecionado}".` : "Nenhuma quadra encontrada."}
            </p>
            {esporteSelecionado && (
              <button onClick={() => setEsporteSelecionado("")} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>
                Limpar Filtro
              </button>
            )}
          </div>
        )}

        <div className={styles.actionsContainer}>
          <Link to="/home" className={`${styles.btn} ${styles.btnOutline}`}>
            <FaArrowLeft className={styles.btnIcon} /> Voltar para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Quadras;