import React, { useEffect, useRef } from 'react';

import { useAudioPlayer } from '../../AudioContext';

function VideoPlayer({ songFile, song }) {
  const { videoTime } = useAudioPlayer();

  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current.currentTime = song.currentTime; // Set the video's currentTime
  }, [videoTime]); // TODO: Better way to do this? Need this component to update but would rather not have an extra useState

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
