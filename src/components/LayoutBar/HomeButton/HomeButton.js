import HomeSVG from './home.svg';

function HomeButton() {
  return (
    <div className="button-container">
      <img className="force" src={HomeSVG}></img>
      <span>Home</span>
    </div>
  );
}

export default HomeButton;
