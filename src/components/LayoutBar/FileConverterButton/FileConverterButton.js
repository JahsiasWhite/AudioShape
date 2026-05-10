import FileConverterSVG from './FileConverter.svg';

function FileConverterButton() {
  return (
    <div className="button-container">
      <img className="force" src={FileConverterSVG}></img>
      <span>Converter</span>
    </div>
  );
}

export default FileConverterButton;
