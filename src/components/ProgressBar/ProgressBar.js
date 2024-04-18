import './ProgressBar.css';

export default function ProgressBar({ progress }) {
  const barStyle = { width: `${progress}%` };
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={barStyle} />
    </div>
  );
}
