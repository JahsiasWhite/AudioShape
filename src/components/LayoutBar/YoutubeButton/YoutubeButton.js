import YoutubeSVG from './Youtube.svg';

function YoutubeButton() {
  return (
    <div className="button-container">
      <img className="icon" src={YoutubeSVG}></img>
      <span>Youtube</span>
    </div>
  );
}

export default YoutubeButton;
