"use client";

import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Volume2,
  Search,
  Home as HomeIcon,
  Library,
  User,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import "./global.css";

// Full music database (same as before)
const artists = [
  { id: 1, name: "Elsa Melody", image: "https://picsum.photos/id/104/200/200", followers: "2.5M" },
  { id: 2, name: "Snow Symphony", image: "https://picsum.photos/id/15/200/200", followers: "1.8M" },
  { id: 3, name: "Aurora Vibes", image: "https://picsum.photos/id/96/200/200", followers: "3.2M" },
  { id: 4, name: "Glacier Peak", image: "https://picsum.photos/id/22/200/200", followers: "890K" },
  { id: 5, name: "Winter Wind", image: "https://picsum.photos/id/30/200/200", followers: "1.5M" },
];

const albums = [
  { id: 1, name: "Winter Tales", artist: "Elsa Melody", image: "https://picsum.photos/id/104/200/200", year: "2024", songs: 12 },
  { id: 2, name: "Frozen Echoes", artist: "Snow Symphony", image: "https://picsum.photos/id/15/200/200", year: "2023", songs: 10 },
  { id: 3, name: "Arctic Nights", artist: "Aurora Vibes", image: "https://picsum.photos/id/96/200/200", year: "2024", songs: 14 },
  { id: 4, name: "Melting Moments", artist: "Glacier Peak", image: "https://picsum.photos/id/22/200/200", year: "2023", songs: 8 },
  { id: 5, name: "Dance of Snow", artist: "Winter Wind", image: "https://picsum.photos/id/30/200/200", year: "2024", songs: 11 },
];

const allSongs = [
  { id: 1, title: "Frozen Heart", artist: "Elsa Melody", artistId: 1, album: "Winter Tales", albumId: 1, duration: "3:45", cover: "https://picsum.photos/id/104/200/200", plays: "1.2M", trending: true, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
  { id: 2, title: "Ice Castle Dreams", artist: "Snow Symphony", artistId: 2, album: "Frozen Echoes", albumId: 2, duration: "4:12", cover: "https://picsum.photos/id/15/200/200", plays: "892K", trending: true, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
  { id: 3, title: "Northern Lights", artist: "Aurora Vibes", artistId: 3, album: "Arctic Nights", albumId: 3, duration: "3:58", cover: "https://picsum.photos/id/96/200/200", plays: "2.1M", trending: true, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
  { id: 4, title: "Espresso", artist: "Sabrina Carpenter", artistId: 4, album: "Short n' Sweet", albumId: 4, duration: "3:21", cover: "https://i.ytimg.com/vi/51zjlMhdSTE/maxresdefault.jpg", plays: "900M", trending: true, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
  { id: 5, title: "Snowflake Waltz", artist: "Winter Wind", artistId: 5, album: "Dance of Snow", albumId: 5, duration: "3:30", cover: "https://picsum.photos/id/30/200/200", plays: "1.5M", trending: true, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
  { id: 6, title: "Arctic Sunrise", artist: "Polar Dawn", artistId: 6, album: "Morning Frost", albumId: 6, duration: "4:05", cover: "https://picsum.photos/id/42/200/200", plays: "987K", trending: false, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
  { id: 7, title: "Winter Magic", artist: "Elsa Melody", artistId: 1, album: "Winter Tales", albumId: 1, duration: "3:52", cover: "https://picsum.photos/id/20/200/200", plays: "1.8M", trending: true, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
  { id: 8, title: "Snow Queen's Dance", artist: "Aurora Vibes", artistId: 3, album: "Arctic Nights", albumId: 3, duration: "4:15", cover: "https://picsum.photos/id/29/200/200", plays: "2.3M", trending: false, audio: "https://res.cloudinary.com/dqxuz1q6i/video/upload/v1775568901/Sabrina_Carpenter_-_Espresso_sfhscb.mp3" },
];

type Page = "home" | "artist" | "album" | "search";

export default function Home() {

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const [currentSong, setCurrentSong] = useState(allSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [sliderIndex, setSliderIndex] = useState(0);


  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const onTimeUpdate = () => setCurrentTime(audio.currentTime);
  const onLoaded = () => setDuration(audio.duration || 0);

  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.addEventListener("loadedmetadata", onLoaded);

  return () => {
    audio.removeEventListener("timeupdate", onTimeUpdate);
    audio.removeEventListener("loadedmetadata", onLoaded);
  };
}, [currentSong]);

useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.pause();
  audio.load();
}, [currentSong]);

useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  if (isPlaying) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}, [isPlaying, currentSong]);

useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleEnd = () => setIsPlaying(false);

  audio.addEventListener("ended", handleEnd);
  return () => audio.removeEventListener("ended", handleEnd);
}, []);

// Update volume when it changes
useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = volume;
  }
}, [volume]);

  const toggleLike = (songId: number) => {
    setLikedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage("search");
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage("home");
  };

  const goToArtist = (artist: any) => {
    setSelectedArtist(artist);
    setCurrentPage("artist");
  };

  const goToAlbum = (album: any) => {
    setSelectedAlbum(album);
    setCurrentPage("album");
  };

  const goToHome = () => {
    setCurrentPage("home");
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSearchQuery("");
    setSearchInput("");
  };

  const getCurrentSongs = () => {
    if (currentPage === "artist" && selectedArtist) {
      return allSongs.filter(song => song.artistId === selectedArtist.id);
    }
    if (currentPage === "album" && selectedAlbum) {
      return allSongs.filter(song => song.albumId === selectedAlbum.id);
    }
    if (currentPage === "search" && searchQuery) {
      return allSongs.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  };

  const formatTime = (time: number) => {
  if (!time || isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const currentSongs = getCurrentSongs();
  const trendingSongs = allSongs.filter(song => song.trending);

  const nextSlide = () => {
    setSliderIndex((prev) => (prev + 1) % trendingSongs.length);
  };

  const prevSlide = () => {
    setSliderIndex((prev) => (prev - 1 + trendingSongs.length) % trendingSongs.length);
  };

  return (
    
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="logo-container" onClick={goToHome}>
            <div className="logo-icon-wrapper">
              <img src="/Flake.jpg" alt="Frozen Beats Logo" className="logo-icon" />
            </div>
            <h1 className="logo-text">Frozen Beats</h1>
          </div>
          
          <nav className="nav">
            <button onClick={goToHome} className="nav-button">
              <HomeIcon className="nav-icon" />
              <span>Home</span>
            </button>
            <button className="nav-button">
              <Search className="nav-icon" />
              <span>Search</span>
            </button>
            <button className="nav-button">
              <Library className="nav-icon" />
              <span>Library</span>
            </button>
            <button className="nav-button">
              <User className="nav-icon" />
              <span>Profile</span>
            </button>
          </nav>

          <div className="library-section">
            <p className="library-title">Your Library</p>
            <div className="library-items">
              <div className="library-item library-item-primary">
                ✨ Favorites ({likedSongs.length})
              </div>
              <div className="library-item library-item-secondary">
                ❄️ Recently Played
              </div>
              <div className="library-item library-item-secondary">
                🎵 Playlists
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header with Search */}
        <div className="header">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search frozen melodies... (Press Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="search-input"
            />
            {searchInput && (
              <button onClick={clearSearch} className="clear-search">
                <X className="clear-icon" />
              </button>
            )}
          </div>
          <div className="user-section">
            <div className="user-greeting">
              <p className="welcome-text">Welcome back</p>
              <p className="user-name">❄️ Music Lover</p>
            </div>
          </div>
        </div>

        {/* Hero Section - Now Playing */}
        <div className="now-playing-card frozen-card">
          <div className="now-playing-content">
            <div className="now-playing-image">
              <img src={currentSong.cover} alt={currentSong.title} />
            </div>
            <div>
              <p className="now-playing-label">❄️ NOW PLAYING</p>
              <h2 className="now-playing-title">{currentSong.title}</h2>
              <p className="now-playing-meta">{currentSong.artist} • {currentSong.album}</p>
              <div className="controls">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="play-button"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button className="control-button">
                  <SkipBack size={20} />
                </button>
                <button className="control-button">
                  <SkipForward size={20} />
                </button>
                <button className="control-button">
                  <Volume2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        

        {/* HOME PAGE */}
        {currentPage === "home" && (
          <>
            {/* Trending Slider */}
            <div className="trending-slider">
              <div className="section-header">
                <h2 className="section-title">🔥 Trending Now</h2>
                <div className="slider-nav">
                  <button onClick={prevSlide} className="slider-button">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextSlide} className="slider-button">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              <div className="slider-container">
                <div className="slider-track">
                  <div className="slider-item">
                    <div className="trending-card frozen-card">
                      <div className="trending-content">
                        <img 
                          src={trendingSongs[sliderIndex].cover} 
                          alt={trendingSongs[sliderIndex].title}
                          className="trending-image"
                        />
                        <div className="trending-info">
                          <div className="trending-badge">
                            <span className="trending-rank">#{sliderIndex + 1}</span>
                            <span className="trending-label">Trending</span>
                          </div>
                          <h3 className="trending-title">{trendingSongs[sliderIndex].title}</h3>
                          <p className="trending-artist">{trendingSongs[sliderIndex].artist}</p>
                          <p className="trending-plays">{trendingSongs[sliderIndex].plays} plays</p>
                          <button 
                            onClick={() => {
                              setCurrentSong(trendingSongs[sliderIndex]);
                              setIsPlaying(true);
                            }}
                            className="play-button"
                            style={{ marginTop: '16px', padding: '8px 24px' }}
                          >
                            <Play size={16} style={{ display: 'inline', marginRight: '8px' }} /> Play Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Artists */}
            <div style={{ marginBottom: '48px' }}>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>🎤 Popular Artists</h2>
              <div className="artist-grid">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => goToArtist(artist)}
                    className="artist-card frozen-card"
                  >
                    <img src={artist.image} alt={artist.name} className="artist-image" />
                    <h3 className="artist-name">{artist.name}</h3>
                    <p className="artist-followers">{artist.followers} followers</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Albums */}
            <div style={{ marginBottom: '48px' }}>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>📀 Featured Albums</h2>
              <div className="album-grid">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => goToAlbum(album)}
                    className="album-card frozen-card"
                  >
                    <img src={album.image} alt={album.name} className="album-image" />
                    <h3 className="album-name">{album.name}</h3>
                    <p className="album-meta">{album.artist} • {album.year}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Songs Grid */}
            <div>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>❄️ Trending Tracks</h2>
              <div className="songs-grid">
                {trendingSongs.map((song) => (
                  <div
                    key={song.id}
                    className="song-card frozen-card"
                    onClick={() => {
                      setCurrentSong(song);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="song-image-container">
                      <img 
                        src={song.cover} 
                        alt={song.title}
                        className="song-image"
                      />
                      <div className="song-overlay">
                        <button className="song-play-button">
                          <Play size={24} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="song-info">
                      <div>
                        <h3 className="song-title">{song.title}</h3>
                        <p className="song-artist">{song.artist}</p>
                        <p className="song-plays">❄️ {song.plays} plays</p>
                      </div>
                      <div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(song.id);
                          }}
                          className="like-button"
                        >
                          <Heart 
                            size={20}
                            className={likedSongs.includes(song.id) ? "like-icon-liked" : "like-icon"}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ARTIST PAGE */}
        {currentPage === "artist" && selectedArtist && (
          <div>
            <button onClick={goToHome} className="back-button">
              <ChevronLeft size={20} /> Back to Home
            </button>
            
            <div className="artist-header frozen-card">
              <div className="artist-header-content">
                <img src={selectedArtist.image} alt={selectedArtist.name} className="artist-avatar" />
                <div>
                  <p className="artist-type">🎤 ARTIST</p>
                  <h2 className="artist-name-large">{selectedArtist.name}</h2>
                  <p className="artist-stats">{selectedArtist.followers} monthly listeners</p>
                </div>
              </div>
            </div>

            <h2 className="section-title" style={{ marginBottom: '24px' }}>🎵 Popular Songs</h2>
            <div className="songs-grid">
              {currentSongs.map((song) => (
                <div
                  key={song.id}
                  className="song-card frozen-card"
                  onClick={() => {
                    setCurrentSong(song);
                    setIsPlaying(true);
                  }}
                >
                  <div className="song-image-container">
                    <img src={song.cover} alt={song.title} className="song-image" />
                    <div className="song-overlay">
                      <button className="song-play-button">
                        <Play size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="song-info">
                    <div>
                      <h3 className="song-title">{song.title}</h3>
                      <p className="song-artist">{song.album}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} className="like-button">
                      <Heart size={20} className={likedSongs.includes(song.id) ? "like-icon-liked" : "like-icon"} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALBUM PAGE */}
        {currentPage === "album" && selectedAlbum && (
          <div>
            <button onClick={goToHome} className="back-button">
              <ChevronLeft size={20} /> Back to Home
            </button>
            
            <div className="album-header frozen-card">
              <div className="album-header-content">
                <img src={selectedAlbum.image} alt={selectedAlbum.name} className="album-cover" />
                <div>
                  <p className="album-type">📀 ALBUM</p>
                  <h2 className="album-name-large">{selectedAlbum.name}</h2>
                  <p className="album-details">{selectedAlbum.artist} • {selectedAlbum.year} • {selectedAlbum.songs} songs</p>
                </div>
              </div>
            </div>

            <h2 className="section-title" style={{ marginBottom: '24px' }}>🎵 Tracklist</h2>
            <div className="tracklist">
              {currentSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="track-item frozen-card"
                  onClick={() => {
                    setCurrentSong(song);
                    setIsPlaying(true);
                  }}
                >
                  <div className="track-left">
                    <span className="track-number">#{index + 1}</span>
                    <div>
                      <h3 className="track-title">{song.title}</h3>
                      <p className="track-duration">{song.duration}</p>
                    </div>
                  </div>
                  <div className="track-actions">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} className="like-button">
                      <Heart size={20} className={likedSongs.includes(song.id) ? "like-icon-liked" : "like-icon"} />
                    </button>
                    <Play size={20} style={{ color: '#0A74DA' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH PAGE */}
        {currentPage === "search" && (
          <div>
            <h2 className="search-results">
              {currentSongs.length === 0 ? `No results for "${searchQuery}"` : `Search results for "${searchQuery}" (${currentSongs.length} songs)`}
            </h2>
            {currentSongs.length === 0 ? (
              <div className="empty-state">
                <p className="empty-message">No songs found matching "{searchQuery}"</p>
                <p className="empty-hint">Try searching for "Frozen", "Ice", or "Snow"</p>
              </div>
            ) : (
              <div className="songs-grid">
                {currentSongs.map((song) => (
                  <div
                    key={song.id}
                    className="song-card frozen-card"
                    onClick={() => {
                      setCurrentSong(song);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="song-image-container">
                      <img src={song.cover} alt={song.title} className="song-image" />
                      <div className="song-overlay">
                        <button className="song-play-button">
                          <Play size={24} />
                        </button>
                      </div>
                    </div>
                    <div className="song-info">
                      <div>
                        <h3 className="song-title">{song.title}</h3>
                        <p className="song-artist">{song.artist}</p>
                        <p className="song-plays">❄️ {song.plays} plays</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} className="like-button">
                        <Heart size={20} className={likedSongs.includes(song.id) ? "like-icon-liked" : "like-icon"} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

       {/* Now Playing Bar */}
<div className="now-playing-bar">
  <div className="bar-content">
    <div className="bar-song-info">
      <div className="bar-song-image">
        <img src={currentSong.cover} alt={currentSong.title} />
      </div>
      <div>
        <p className="bar-song-title">{currentSong.title}</p>
        <p className="bar-song-artist">{currentSong.artist}</p>
      </div>
    </div>
    
    <div className="bar-controls">
      <button className="bar-control-button">
        <SkipBack size={20} />
      </button>
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="bar-play-button"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <button className="bar-control-button">
        <SkipForward size={20} />
      </button>
    </div>
    
    <div className="bar-volume">
      <Volume2 size={16} style={{ color: 'white' }} />
      <div 
        className="volume-slider-container"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          setVolume(Math.max(0, Math.min(1, percent)));
        }}
      >
        <div className="volume-progress" style={{ width: `${volume * 100}%` }} />
      </div>
    </div>
  </div>
  
  <div className="progress-wrapper">
    <div 
      className="progress-slider"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audioRef.current && duration) {
          const newTime = percent * duration;
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      }}
    >
      <div className="progress-progress" style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }} />
    </div>
    <span className="bar-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
  </div>
</div>

<audio ref={audioRef} src={currentSong.audio} />
</div>
</div>
    
  );
}