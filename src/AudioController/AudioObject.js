import { useState } from 'react';

export const AudioObject = () => {
  const [currentSong, setCurrentSong] = useState(new Audio());
  return {
    currentSong,
  };
};
