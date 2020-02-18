import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './Header.module.scss';

interface HeaderProps {
  logo: string;
}

const Header: FC<HeaderProps> = (props: HeaderProps) => {
  return (
    <header className={styles.header}>
      <img src={props.logo} alt="logo" />
      <FontAwesomeIcon icon="cog" className={`${styles.settingsLogo} ${styles.headerRight}`} />
    </header>
  );
};

export default Header;
