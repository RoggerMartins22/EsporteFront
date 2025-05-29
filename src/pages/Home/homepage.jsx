import { Link } from "react-router-dom";
import { FaInstagram, FaCheckCircle, FaUserPlus, FaSignInAlt, FaArrowRight } from "react-icons/fa";
import styles from "./homePage.module.css";

function Home() {

  return (
    <div className={styles.homeContainer}>
      <header className={styles.homeHeader}>
        <div className={styles.homeHeaderInner}>
          <div className={styles.logoTitle}>
            <img
              src="https://www.rioverde.go.gov.br/wp-uploads/2025/02/logo-rioverdebranca.png"
              alt="Logo Prefeitura de Rio Verde"
              className={styles.homeLogo}
            />
            <h1 className={styles.homeTitle}>Esporte+</h1>
          </div>
          <nav className={styles.homeNav}>
            <Link to="/cadastro" className={`${styles.btn} ${styles.btnOutline}`}>
              <FaUserPlus className={styles.btnIcon} /> Cadastre-se
            </Link>
            <Link to="/login" className={`${styles.btn} ${styles.btnPrimary}`}>
              <FaSignInAlt className={styles.btnIcon} /> Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.homeMain}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroHeadline}>Sua Quadra. Seu Horário. Sem Complicações.</h2>
            <p className={styles.heroSubtitle}>
              O Esporte+ é a sua plataforma definitiva para agendamento de quadras esportivas públicas em Rio Verde. Conecte-se, jogue e viva o esporte.
            </p>
            <Link to="/quadras" className={`${styles.btn} ${styles.btnHero}`}>
              Agendar Quadra Agora <FaArrowRight className={styles.btnIcon} />
            </Link>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Recursos Que Simplificam Seu Jogo</h2>
          <div className={styles.cardsGrid}>
            <div className={styles.card}>
              <h3>Agendamento Fácil</h3>
              <ul>
                <li><FaCheckCircle className={styles.cardIcon} /> Interface intuitiva e rápida.</li>
                <li><FaCheckCircle className={styles.cardIcon} /> Reserve seu horário em segundos.</li>
                <li><FaCheckCircle className={styles.cardIcon} /> Disponível 24/7.</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3>Horários em Tempo Real</h3>
              <ul>
                <li><FaCheckCircle className={styles.cardIcon} /> Veja a disponibilidade de cada quadra.</li>
                <li><FaCheckCircle className={styles.cardIcon} /> Evite surpresas e garanta sua reserva.</li>
                <li><FaCheckCircle className={styles.cardIcon} /> Atualizações instantâneas.</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3>Controle e Organização</h3>
              <ul>
                <li><FaCheckCircle className={styles.cardIcon} /> Histórico de agendamentos.</li>
                <li><FaCheckCircle className={styles.cardIcon} /> Notificações personalizáveis.</li>
                <li><FaCheckCircle className={styles.cardIcon} /> Sua agenda esportiva na palma da mão.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.contactSection}>
          <h2 className={styles.sectionTitle}>Onde Estamos e Como Nos Achar</h2>
          <div className={styles.contactContent}>
            <div className={`${styles.card} ${styles.contactCard}`}>
              <h3>Informações de Contato</h3>
              <p><strong>Endereço:</strong> Av. Presidente Vargas, n° 3215, Vila Maria</p>
              <p><strong>CEP:</strong> 75905-900</p>
              <p><strong>Email:</strong> <a href="mailto:secom@rioverde.go.gov.br">secom@rioverde.go.gov.br</a></p>
              <p><strong>Telefone:</strong> (64) 3602-8000</p>
              <p><strong>Atendimento:</strong> Seg. a Sex. das 8h às 11h30 e 13h às 17h30</p>
            </div>
            <div className={styles.mapPlaceholder}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1343.1947997085804!2d-50.90837387074805!3d-17.785651968012445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9361db6642265b6d%3A0xc586c45fc2f3e5ff!2sPrefeitura%20Municipal%20de%20Rio%20Verde!5e0!3m2!1spt-BR!2sbr!4v1748434973746!5m2!1spt-BR!2sbr"
                width="100%"
                style={{ border: 0, borderRadius: '1.2rem', height: '100%' }} 
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Prefeitura de Rio Verde"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.homeFooter}>
        <span>© 2025 Prefeitura de Rio Verde - Sistema Esporte+. Todos os direitos reservados.</span>
        <a
          href="https://www.instagram.com/prefrioverde/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerIcon}
          aria-label="Instagram da Prefeitura de Rio Verde"
        >
          <FaInstagram size={24} />
        </a>
      </footer>
    </div>
  );
}

export default Home;