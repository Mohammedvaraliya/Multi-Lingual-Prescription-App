import { useState, useEffect } from "react";
import { PlayIcon, PauseIcon, DownloadIcon } from "./Icons";

export function AudioPlayer({ audioUrl, text, language }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = document.getElementById("prescription-audio");
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = document.getElementById("prescription-audio");
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleProgressClick = (e) => {
    const audio = document.getElementById("prescription-audio");
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const downloadAudio = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `prescription-audio-${language}.mp3`;
    a.click();
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
      <audio id="prescription-audio" src={audioUrl} />

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="flex-1">
          <div
            onClick={handleProgressClick}
            className="w-full h-2 bg-gray-300 rounded-full cursor-pointer hover:h-3 transition-all"
          >
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={downloadAudio}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <DownloadIcon />
        Download Audio
      </button>
    </div>
  );
}
