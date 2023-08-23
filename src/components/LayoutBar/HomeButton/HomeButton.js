function HomeButton({ toggleSection }) {
  return <div onClick={() => toggleSection('allSongs')}>Home</div>;
}

export default HomeButton;
