import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './Header.module.scss';

interface HeaderProps {
  logo: string;
}

const Header: FC<HeaderProps> = (props: HeaderProps) => {
  return (
    <header className={classes.header}>
      <img src={props.logo} alt="logo" />
      <FontAwesomeIcon
        icon="cog"
        className={`${classes['settings-logo']} ${classes['header-right']}`}
      />
    </header>
  );
};

export default Header;
