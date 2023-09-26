import HomeSVG from './home.svg';

function HomeButton() {
  return (
    <div className="button-container">
      <img className="force" src={HomeSVG}></img>Home
    </div>
  );
}

export default HomeButton;
