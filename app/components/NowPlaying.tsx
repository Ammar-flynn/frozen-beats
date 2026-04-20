import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat } from "lucide-react";
import { Song } from "../types";
import { RefObject, useState, useRef, useEffect } from "react";

interface NowPlayingBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
  audioRef: RefObject<HTMLAudioElement | null>;
  sidebarCollapsed: boolean;
  isQueueOpen?: boolean;
  isPlaylistOpen?: boolean;
}

export function NowPlayingBar({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious, 
  volume, 
  onVolumeChange, 
  currentTime, 
  duration, 
  formatTime,
  audioRef,
  sidebarCollapsed,
  isQueueOpen = false,
  isPlaylistOpen = false
}: NowPlayingBarProps) {
  // Drag states
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [dragVolume, setDragVolume] = useState(0);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isVertical, setIsVertical] = useState(false); // Add this state
  
  // Refs for slider containers
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVertical(window.innerWidth <= 420);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Toggle loop function
  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(previousVolume > 0 ? previousVolume : 1);
    }
  };

  // Update progress from event
  const updateProgressFromEvent = (clientX: number) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    setDragProgress(percent);
  };

  // Update volume from event - supports both horizontal and vertical
  const updateVolumeFromEvent = (clientX: number, clientY?: number) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    let percent;
    
    if (isVertical) {
      // Vertical calculation - use Y coordinate
      const y = clientY !== undefined ? clientY : clientX;
      percent = 1 - (y - rect.top) / rect.height;
    } else {
      // Horizontal calculation - use X coordinate
      percent = (clientX - rect.left) / rect.width;
    }
    
    percent = Math.max(0, Math.min(1, percent));
    setDragVolume(percent);
  };

  // Handle progress drag start
  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProgress(true);
    updateProgressFromEvent(e.clientX);
  };

  const handleProgressTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProgress(true);
    const touch = e.touches[0];
    updateProgressFromEvent(touch.clientX);
  };

  // Handle volume drag start
  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVolume(true);
    updateVolumeFromEvent(e.clientX, e.clientY);
  };

  const handleVolumeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVolume(true);
    const touch = e.touches[0];
    updateVolumeFromEvent(touch.clientX, touch.clientY);
  };

  // Handle global move and up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress) {
        updateProgressFromEvent(e.clientX);
        if (audioRef?.current && duration) {
          audioRef.current.currentTime = dragProgress * duration;
        }
      }
      if (isDraggingVolume) {
        updateVolumeFromEvent(e.clientX, e.clientY);
        onVolumeChange(dragVolume);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingProgress) {
        e.preventDefault();
        const touch = e.touches[0];
        updateProgressFromEvent(touch.clientX);
        if (audioRef?.current && duration) {
          audioRef.current.currentTime = dragProgress * duration;
        }
      }
      if (isDraggingVolume) {
        e.preventDefault();
        const touch = e.touches[0];
        updateVolumeFromEvent(touch.clientX, touch.clientY);
        onVolumeChange(dragVolume);
      }
    };

    const handleEnd = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    if (isDraggingProgress || isDraggingVolume) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDraggingProgress, isDraggingVolume, dragProgress, dragVolume, audioRef, duration, onVolumeChange]);

  // Reset drag progress when not dragging
  useEffect(() => {
    if (!isDraggingProgress) {
      setDragProgress(currentTime / duration || 0);
    }
  }, [currentTime, duration, isDraggingProgress]);

  // Reset drag volume when not dragging
  useEffect(() => {
    if (!isDraggingVolume) {
      setDragVolume(volume);
    }
  }, [volume, isDraggingVolume]);

  // Set loop property on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [audioRef, isLooping, currentSong]);

  // Get current display progress
  const displayProgress = isDraggingProgress ? dragProgress : (duration ? currentTime / duration : 0);
  const displayVolume = isDraggingVolume ? dragVolume : volume;

  // Get volume progress style based on orientation
  const getVolumeProgressStyle = () => {
    if (isVertical) {
      return { height: `${displayVolume * 100}%`, width: '100%' };
    }
    return { width: `${displayVolume * 100}%` };
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingVolume) {
      updateVolumeFromEvent(e.clientX, e.clientY);
      onVolumeChange(dragVolume);
    }
  };

  const handleVolumeTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingVolume) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      updateVolumeFromEvent(touch.clientX, touch.clientY);
      onVolumeChange(dragVolume);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) {
      updateProgressFromEvent(e.clientX);
      if (audioRef?.current && duration) {
        audioRef.current.currentTime = dragProgress * duration;
      }
    }
  };

  const handleProgressTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      updateProgressFromEvent(touch.clientX);
      if (audioRef?.current && duration) {
        audioRef.current.currentTime = dragProgress * duration;
      }
    }
  };

  // Generate class names dynamically
  const barClasses = [
    'now-playing-bar',
    sidebarCollapsed ? 'collapsed' : '',
    isQueueOpen ? 'with-queue' : '',
    isPlaylistOpen ? 'with-playlist' : ''
  ].filter(Boolean).join(' ');

  if (!currentSong) return null;

  return (
    <div className={barClasses}>
      <div className="bar-content">
        <div className="bar-song-info">
          <div className="bar-song-image">
            <img src={currentSong.coverUrl} alt={currentSong.title} />
          </div>
          <div>
            <p className="bar-song-title">{currentSong.title}</p>
            <p className="bar-song-artist">{currentSong.artist}</p>
          </div>
        </div>
        <div className="bar-controls">
          <button onClick={onPrevious} className="bar-control-button">
            <SkipBack size={20} />
          </button>
          <button onClick={onPlayPause} className="bar-play-button">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={onNext} className="bar-control-button">
            <SkipForward size={20} />
          </button>
          <button onClick={toggleLoop} className="bar-control-button" style={{ color: isLooping ? '#87CEEB' : 'white' }}>
            <Repeat size={16} />
          </button>
        </div>
        <div className="bar-volume">
          <button onClick={toggleMute} className="bar-control-button" style={{ padding: '4px' }}>
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div 
            ref={volumeRef}
            className={`volume-slider-container ${isDraggingVolume ? 'dragging' : ''}`}
            onMouseDown={handleVolumeMouseDown}
            onTouchStart={handleVolumeTouchStart}
            onClick={handleVolumeClick}
            onTouchEnd={handleVolumeTouchEnd}
          >
            <div 
              className="volume-progress" 
              style={getVolumeProgressStyle()} 
            />
          </div>
        </div>
      </div>
      <div className="progress-wrapper">
        <div 
          ref={progressRef}
          className={`progress-slider ${isDraggingProgress ? 'dragging' : ''}`}
          onMouseDown={handleProgressMouseDown}
          onTouchStart={handleProgressTouchStart}
          onClick={handleProgressClick}
          onTouchEnd={handleProgressTouchEnd}
        >
          <div className="progress-progress" style={{ width: `${displayProgress * 100}%` }} />
        </div>
        <span className="bar-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
    </div>
  );
}

