import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Song } from "../types";

interface TrendingSliderProps {
  trendingSongs: Song[];
  sliderIndex: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onPlay: (song: Song) => void;
}

export function TrendingSlider({ trendingSongs, sliderIndex, onPrevSlide, onNextSlide, onPlay }: TrendingSliderProps) {
  if (trendingSongs.length === 0) return null;

  return (
    <div className="trending-slider">
      <div className="section-header">
        <h2 className="section-title">🔥 Trending Now</h2>
        <div className="slider-nav">
          <button onClick={onPrevSlide} className="slider-button">
            <ChevronLeft size={20} />
          </button>
          <button onClick={onNextSlide} className="slider-button">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="slider-container">
        <div 
          className="slider-track" 
          style={{ transform: `translateX(-${sliderIndex * 100}%)` }}
        >
          {trendingSongs.map((song, index) => (
             <div key={index} className="slider-item">
              <div className="trending-card frozen-card">
                <div className="trending-content">
                  <img src={song.coverUrl} alt={song.title} className="trending-image" />
                  <div className="trending-info">
                    <div className="trending-badge">
                      <span className="trending-rank">#{index + 1}</span>
                      <span className="trending-label">Trending</span>
                    </div>
                    <h3 className="trending-title">{song.title}</h3>
                    <p className="trending-artist">{song.artist}</p>
                    <p className="trending-plays">{song.plays.toLocaleString()} plays</p>
                    <button 
                      onClick={() => onPlay(song)} 
                      className="play-button" 
                      style={{ marginTop: '16px', padding: '8px 24px' }}
                    >
                      <Play size={16} style={{ display: 'inline', marginRight: '8px' }} /> Play Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}