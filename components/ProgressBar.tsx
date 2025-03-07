interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="progress-bar-bg">
      <div 
        className="progress-bar"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
} 