function HomeButton({ toggleSection }) {
  return <div onClick={() => toggleSection('songs')}>Home</div>;
}

export default HomeButton;
