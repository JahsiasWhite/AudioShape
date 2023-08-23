import React from 'react';
import './ContextMenu.css'; // Generic?

function ContextMenu({ onContextMenu, style }) {
  const handleContextMenu = (event) => {
    event.preventDefault();
    onContextMenu(event);
  };

  return (
    <div
      className="context-menu-container"
      style={style}
      onContextMenu={handleContextMenu}
    >
      <ul className="context-menu">
        <li>Add to playlist</li>
        <li>Edit</li>
        <li>Add to queue</li>
      </ul>
    </div>
  );
}

export default ContextMenu;
