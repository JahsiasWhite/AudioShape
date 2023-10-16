import React, { useEffect, useRef } from 'react';

import { useAudioPlayer } from '../../AudioContext';

function VideoPlayer({ songFile, song }) {
  const { videoTime, currentSpeed } = useAudioPlayer();

  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current.currentTime = song.currentTime; // Set the video's currentTime
    console.error('NEW VIDEO TIME: ' + song.currentTime);

    videoRef.current.playbackRate = currentSpeed; // TODO ! Takes time to render, setCurrentSpeed fires too fast meaning song.currentTime isn't updated properly
  }, [videoTime, currentSpeed]); // TODO: Better way to do this? Need this component to update but would rather not have an extra useState

  return (
    <video
      className="song-video"
      autoPlay
      controls={false}
      muted={true} // Mute the video
      ref={videoRef}
    >
      <source src={songFile} type="video/mp4" />
      Your device doesn't support video streaming
    </video>
  );
}

export default VideoPlayer;
