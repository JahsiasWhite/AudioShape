import React, { useEffect, useRef } from 'react';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function VideoPlayer({ songFile, song }) {
  const firstTime = useRef(true);
  const { videoTime, currentSpeed, isPlaying, loadingQueue } = useAudioPlayer();

  const videoRef = useRef(null);

  useEffect(() => {
    // Use videoTime directly — song.currentTime may not have updated yet when this effect runs
    // (the browser's audio seek is async, so reading song.currentTime here could return the old position)
    videoRef.current.currentTime = videoTime;
  }, [videoTime]);

  useEffect(() => {
    // If loading is done, update the video
    if (loadingQueue.length === 0) {
      songFile = songFile.replace(/[#\$]/g, function (match) {
        // TODO This is used in multiple spots...
        if (match === '#') {
          return '%23';
        } else {
          return '$';
        }
      });
      videoRef.current.src = songFile;
      videoRef.current.currentTime = song.currentTime; // Set the video's currentTime
      videoRef.current.playbackRate = currentSpeed; // TODO ! Takes time to render, setCurrentSpeed fires too fast meaning song.currentTime isn't updated properly
    }
  }, [loadingQueue]);

  useEffect(() => {
    videoRef.current.playbackRate = currentSpeed;
  }, [currentSpeed]);

  // ? Will the current time slowly lose sync? If we update currentTime everytime though, there is a visual stutter
  useEffect(() => {
    if (isPlaying) {
      // Dont want this to activate the first time we load...
      // This is annoying but its a requirement for having the encoding replace chars
      // TODO Maybe a better option...
      if (firstTime.current) {
        firstTime.current = false;
        return;
      }

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
