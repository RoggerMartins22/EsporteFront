import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import styles from './footer.module.css'; 

function Footer() {
  const currentYear = 2025;

  return (
    <footer className={styles.footerContainer}>
      <span>© {currentYear} Prefeitura de Rio Verde - Sistema Esporte+. Todos os direitos reservados.</span>
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
  );
}

export default Footer;