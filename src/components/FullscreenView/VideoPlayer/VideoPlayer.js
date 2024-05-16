import React, { useEffect, useRef } from 'react';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function VideoPlayer({ songFile, song }) {
  const firstTime = useRef(true);
  const { videoTime, currentSpeed, isPlaying, loadingQueue } = useAudioPlayer();

  const videoRef = useRef(null);

  useEffect(() => {
    // Whenever the song or song ID changes, update the video source
    // videoRef.current.src = songFile;

    videoRef.current.currentTime = song.currentTime; // Set the video's currentTime

    // videoRef.current.playbackRate = currentSpeed; // TODO ! Takes time to render, setCurrentSpeed fires too fast meaning song.currentTime isn't updated properly
  }, [videoTime]); // TODO: Better way to do this? Need this component to update but would rather not have an extra useState

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
