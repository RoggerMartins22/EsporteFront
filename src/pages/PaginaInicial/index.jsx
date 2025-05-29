import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaSpinner, FaSadTear, FaTimesCircle, FaClock } from "react-icons/fa";
import { TbLayoutGrid } from "react-icons/tb";
import api from "../../services/api";
import styles from "./paginaInicial.module.css";
import useScrollEnabled from '../../hooks/useScrollEnable';
import axios from "axios";

function Home() {

  useScrollEnabled(false);
  const [userName, setUserName] = useState("Usuário");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoadingDashboard(true);
      setErrorDashboard(null);
      try {
        const userResponse = await api.get("/usuario-info/");
        if (userResponse.data && userResponse.data.nome) {
          setUserName(userResponse.data.nome.split(" ")[0]);
        }

        const appointmentResponse = await api.get("/agendamentos/proximo");
        if (appointmentResponse.data) {
          setNextAppointment(appointmentResponse.data);
        } else {
          setNextAppointment(null);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);

        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          if (error.config.url.includes("/agendamentos/proximo")) {
            setNextAppointment(null);
            setErrorDashboard(null);
            setLoadingDashboard(false);
            return;
          }
        }

        setErrorDashboard("Não foi possível carregar as informações. Tente novamente.");
        setUserName("Usuário");
        setNextAppointment(null);
      } finally {
        setLoadingDashboard(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardBox}>
        {loadingDashboard ? (
          <div className={styles.feedbackContainer}>
            <FaSpinner className={`${styles.icon} ${styles.spinner}`} />
            <p className={styles.feedbackMessage}>Carregando seu dashboard...</p>
          </div>
        ) : errorDashboard ? (
          <div className={styles.feedbackContainer}>
            <FaTimesCircle className={`${styles.icon} ${styles.errorIcon}`} />
            <p className={`${styles.feedbackMessage} ${styles.errorMessageText}`}>{errorDashboard}</p>
          </div>
        ) : (
          <>
            <h1 className={styles.dashboardTitle}>
              Olá, <span className={styles.dashboardTitleHighlight}>{userName}</span>!
            </h1>

            <p className={styles.dashboardSubtitle}>
              Sua plataforma completa para gerenciar quadras. O que você gostaria de fazer hoje?
            </p>

            {nextAppointment ? (
              <Link to={`/agendamento/${nextAppointment.id_agendamento}/opcoes`} className={styles.nextAppointmentCardLink}>
                <div className={styles.nextAppointmentCard}>
                  <div className={styles.nextAppointmentHeader}>
                    <FaCalendarAlt className={styles.nextAppointmentHeaderIcon} />
                    <h4>Seu Próximo Agendamento</h4>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Quadra:</span>
                      <span className={styles.detailValue}><strong>{nextAppointment.nome_quadra || 'Quadra Agendada'}</strong></span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Data:</span>
                      <span className={styles.detailValue}>
                        {new Date(nextAppointment.data).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Horário:</span>
                      <span className={styles.detailValue}>
                        {nextAppointment.horario_inicio?.slice(0, 5)} -{' '}
                        {nextAppointment.horario_fim?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className={styles.noAppointmentMessageContainer}>
                <FaSadTear className={styles.noAppointmentIcon} />
                <p className={styles.noAppointmentMessage}>Você não possui agendamentos futuros.</p>
                <Link to="/quadras" className={`${styles.btnDashboard} ${styles.btnSmallPrimary}`}>
                  Agendar minha primeira quadra!
                </Link>
              </div>
            )}

            <div className={styles.dashboardButtonsGroup}>
              <Link to="/quadras" className={`${styles.btnDashboard} ${styles.btnPrimary}`}>
                <TbLayoutGrid className={styles.btnIcon} />
                Ver Quadras
              </Link>
              <Link
                to="/listar"
                className={`${styles.btnDashboard} ${styles.btnOutline}`}
              >
                <FaCalendarAlt className={styles.btnIcon} />
                Meus Agendamentos
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;