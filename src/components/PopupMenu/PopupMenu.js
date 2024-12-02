import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../../AudioController/AudioContext';

// So we don't render all of the hooks when the popup isn't showing
import PopupMenuData from './PopupMenuData';

export default function PopupMenu() {
  const { togglePopup } = useAudioPlayer();
  const [isVisible, setIsVisible] = useState(true);

  const toggleShowing = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    toggleShowing();
  }, [togglePopup]);

  return <>{isVisible && <PopupMenuData setIsVisible={setIsVisible} />}</>;
}
