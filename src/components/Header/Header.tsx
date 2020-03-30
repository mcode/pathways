import React, { FC, useState, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { useThemeToggle } from '../ThemeProvider';

import styles from './Header.module.scss';

interface HeaderProps {
  logo: string;
}

const Header: FC<HeaderProps> = (props: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const toggleTheme = useThemeToggle();

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleToggleTheme = (): void => {
    toggleTheme();
    handleClose();
  };

  return (
    <header className={styles.header} id="header">
      <img src={props.logo} alt="logo" />
      <button onClick={handleClick} aria-controls="options-menu" aria-haspopup="true">
        <FontAwesomeIcon icon={faCog} />
      </button>
      <Menu
        id="options-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleToggleTheme}>Toggle Theme</MenuItem>
      </Menu>
    </header>
  );
};

export default Header;
