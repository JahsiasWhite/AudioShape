// DropdownMenu.js
import React from 'react';
import './DropdownMenu.css';

function DropdownMenu({ isOpen }) {
  return <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>HELLO</div>;
}

export default DropdownMenu;
