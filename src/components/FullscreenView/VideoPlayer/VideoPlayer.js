import React, { useEffect, useRef } from 'react';

import { useAudioPlayer } from '../../AudioContext';

function VideoPlayer({ songFile, song }) {
  const { videoTime, currentSpeed, isPlaying } = useAudioPlayer();

  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current.currentTime = song.currentTime; // Set the video's currentTime

    videoRef.current.playbackRate = currentSpeed; // TODO ! Takes time to render, setCurrentSpeed fires too fast meaning song.currentTime isn't updated properly
  }, [videoTime, currentSpeed]); // TODO: Better way to do this? Need this component to update but would rather not have an extra useState

  // ? Will the current time slowly lose sync? If we update currentTime everytime though, there is a visual stutter
  useEffect(() => {
    if (isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

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
