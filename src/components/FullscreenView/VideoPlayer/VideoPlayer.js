import React, { useEffect } from 'react';

function VideoPlayer({ songFile, song }) {
  useEffect(() => {
    console.log('TIME CHANGED', song.currentTime);
  }, []);

  return (
    <video
      className="song-video"
      autoPlay
      controls={false}
      muted={true} // Mute the video
      ref={(videoRef) => {
        if (videoRef) {
          videoRef.currentTime = song.currentTime; // Set the video's currentTime
        }
      }}
    >
      <source src={songFile} type="video/mp4" />
      Your device doesn't support video streaming
    </video>
  );
}

export default VideoPlayer;
