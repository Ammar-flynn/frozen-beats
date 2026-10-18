"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { NowPlayingBar } from "./components/NowPlaying";
import { TrendingSlider } from "./components/TrendingSlider";
import { ArtistGrid } from "./components/ArtistGrid";
import { AlbumGrid } from "./components/AlbumGrid";
import { SongGrid } from "./components/SongGrid";
import { QueueModal } from "./components/QueueModal";
import { AuthModal } from "./components/AuthModal";
import { ArtistPage } from "./components/ArtistPage";
import { AlbumPage } from "./components/AlbumPage";
import { SearchPage } from "./components/SearchPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useAuth } from "./hooks/useAuth";
import { useFavorites } from "./hooks/useFavorites";
import { Page, Song, Artist, Album } from "./types";
import { ChangePasswordModal } from "./components/ChangePasswordModal";

export default function Home() {
  // ========== STATE ==========
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);


  // ========== HOOKS ==========
  const {
    audioRef,
    currentTime,
    duration,
    volume,
    setVolume,
    currentSong,
    setCurrentSong,
    isPlaying,
    setIsPlaying,
    queue,
    currentQueueIndex,
    formatTime,
    playSong,
    addToQueue,
    removeFromQueue,
    playNext,
    playPrevious,
    clearQueue,
    playSongWithQueue,
    reorderQueue,
  } = useAudioPlayer();

  const {
  isLoggedIn,
  user,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  registerUsername,
  setRegisterUsername,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  otp,                 
  setOtp,              
  showOtpInput,        
  authError,
  authMode,
  setAuthMode,
  isLoading,           
  handleLogin,
  handleRegister,
  handleVerifyOtp,     
  handleResendOtp,     
  handleLogout,
  showForgotPassword,
  setShowForgotPassword,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  showResetPassword,
  setShowResetPassword,
  resetPasswordOtp,
  setResetPasswordOtp,
  newPassword,
  setNewPassword,
  isResettingPassword,
  handleForgotPassword,
  handleSendResetOtp,
  handleResetPassword,
  handleBackToLogin,
} = useAuth();

  const isAdmin = user?.role === 'admin';
  const { favorites, setFavorites, fetchFavorites, toggleFavorite, resetFavorites } = useFavorites(songs, isLoggedIn, user);

  // ========== HARDCODED DATA ==========
const hardcodedSongs: Song[] = [
  {
    _id: "hardcoded_1",
    title: "Espresso",
    artist: "Sabrina Carpenter",
    artists: ["Sabrina Carpenter"],
    album: "Short N' Sweet",
    coverUrl: "https://res.cloudinary.com/dyqq9glj6/image/upload/v1777480998/Sabrina_Carpenter_v7sner.jpg",
    albumCoverUrl: "https://res.cloudinary.com/dyqq9glj6/image/upload/v1777481242/Short_n_Sweet_ptykg9.png",
    audioUrl: "https://res.cloudinary.com/dyqq9glj6/video/upload/v1777383693/Espresso_-_Sabrina_Carpenter_jeqj3m.mp3",
    plays: 125678
  },
];


  // ========== HELPER FUNCTIONS ==========

const handleCloseQueue = () => setIsQueueOpen(false);
const handleOpenQueue = () => setIsQueueOpen(true);

  const extractArtistsFromSongs = (apiSongs: Song[]) => {
  const artistMap = new Map();
  apiSongs.forEach(song => {

    const artistsList = song.artists || [song.artist];
    
    artistsList.forEach(artistName => {
      if (!artistMap.has(artistName)) {
        artistMap.set(artistName, {
          id: `api-${artistName.toLowerCase().replace(/\s/g, '-')}`,
          name: artistName,
          image: song.coverUrl,
          followers: Math.floor(Math.random() * 1000000).toLocaleString()
        });
      }
    });
  });
  return Array.from(artistMap.values());
};


const extractAlbumsFromSongs = (apiSongs: Song[]) => {
  const albumMap = new Map<string, {
    id: string;
    name: string;
    artistSet: Set<string>;
    image: string;
    year: string;
    songs: number;
  }>();
  
  apiSongs.forEach(song => {
    const albumName = song.album;
    const artistsList = song.artists || [song.artist];
    
    // Get image URL with fallback
    const imageUrl = song.albumCoverUrl || song.coverUrl || "";
    
    if (!albumMap.has(albumName)) {
      albumMap.set(albumName, {
        id: `api-${albumName.toLowerCase().replace(/\s/g, '-')}`,
        name: albumName,
        artistSet: new Set(artistsList),
        image: imageUrl,
        year: "2024",
        songs: 1
      });
    } else {
      const existing = albumMap.get(albumName)!;
      artistsList.forEach(artist => existing.artistSet.add(artist));
      existing.songs += 1;
      albumMap.set(albumName, existing);
    }
  });
  
  // Convert to final Album format
  const result: Album[] = Array.from(albumMap.values()).map(album => ({
    id: album.id,
    name: album.name,
    artist: album.artistSet.size > 1 ? "Various Artists" : Array.from(album.artistSet)[0],
    image: album.image,
    year: album.year,
    songs: album.songs
  }));
  
  return result;
};

  // ========== MAIN FUNCTIONS ==========
  const fetchSongs = async () => {
  try {
    setLoading(true);
    let apiSongs: Song[] = [];
    
    try {
      const res = await fetch('/api/songs');
      if (res.ok) {
        apiSongs = await res.json();
      }
    } catch (err) {
      console.log('API not available');
    }
    
    const allSongs = [...hardcodedSongs];
    for (const apiSong of apiSongs) {
      const isDuplicate = hardcodedSongs.some(hardcoded => 
        hardcoded.title === apiSong.title && hardcoded.artist === apiSong.artist
      );
      if (!isDuplicate) {
        allSongs.push(apiSong);
      }
    }
    
    setSongs(allSongs);
    return allSongs; 
    
  } catch (err) {
    setError('Failed to load songs');
    console.error(err);
    setSongs(hardcodedSongs);
    return hardcodedSongs; 
  } finally {
    setLoading(false);
  }
};

  // Add this function after fetchSongs
const fetchArtistsFromAPI = async () => {
  try {
    const res = await fetch('/api/artists');
    
    // Extract hardcoded artists from hardcodedSongs
    const hardcodedArtists = extractArtistsFromSongs(hardcodedSongs);
    
    if (res.ok) {
      const artistsData = await res.json();
      
      // Filter out hardcoded artists from API response (to avoid duplicates)
      const filteredApiArtists = artistsData.filter(
        (apiArtist: Artist) => !hardcodedArtists.some(h => h.name === apiArtist.name)
      );
      
      // Combine: Hardcoded first, then API artists
      const mergedArtists = [...hardcodedArtists, ...filteredApiArtists];
      
      setArtists(mergedArtists);
      return true;
    }
    return false;
  } catch (err) {
    console.log('Artists API not available yet');
    return false;
  }
};

  const incrementPlays = async (songId: string) => {
    if (songId.startsWith('hardcoded')) return;
    try {
      await fetch('/api/songs/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId })
      });
    } catch (err) {
      console.error('Failed to increment plays:', err);
    }
  };

  const handlePlaySong = (song: Song) => {
    playSongWithQueue(song);
    incrementPlays(song._id);
  };

  const handleToggleFavorite = async (song: Song) => {
    const result = await toggleFavorite(song);
    if (result.requiresLogin) {
      setCurrentPage("login");
    }
  };


  // LOGOUT HANDLER - Clears everything
  const handleLogoutClick = () => {
    // Clear audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    
    // Clear player state
    clearQueue();
    setIsPlaying(false);
    setCurrentSong(null);
    
    // Clear auth
    handleLogout();
    
    // Clear favorites
    resetFavorites();
    
    // Reset UI state
    setCurrentPage("home");
    setSearchInput("");
    setSearchQuery("");
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setError(null);
    setSliderIndex(0);
  };

  
const handleVerifyOtpAndRedirect = async (e: React.FormEvent) => {
  const success = await handleVerifyOtp(e);
  
  if (success) {
    // Clear any existing player state
    clearQueue();
    setIsPlaying(false);
    setCurrentSong(null);
    
    // Reset search and selection
    setSearchInput("");
    setSearchQuery("");
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setError(null);
    
    // Redirect to home page
    setCurrentPage("home");
    
    // Optional: Show success message
    console.log("Account created and logged in successfully!");
  }
};


  // LOGIN HANDLER - Resets and loads user data
  const handleLoginClick = async (e: React.FormEvent) => {
    const success = await handleLogin(e);
    
    if (success) {
      // Clear previous state before loading new user data
      clearQueue();
      setIsPlaying(false);
      setCurrentSong(null);
      setCurrentPage("home");
      setSearchInput("");
      setSearchQuery("");
      setSelectedArtist(null);
      setSelectedAlbum(null);
      setError(null);
      
      
    }
  };


  // ========== DERIVED DATA ==========
  const trendingSongs = [...songs].sort((a, b) => b.plays - a.plays).slice(0, 10);
const searchResults = () => {
  if (!searchQuery) return [];
  return songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (song.artists && song.artists.some(artist => 
      artist.toLowerCase().includes(searchQuery.toLowerCase())
    )) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

// ========== USE EFFECTS ==========
useEffect(() => {
  const loadData = async () => {
    const loadedSongs = await fetchSongs(); // Get songs directly
    
    const extractedAlbums = extractAlbumsFromSongs(loadedSongs);
    
    // Get hardcoded albums (the ones starting with 'default-')
    const hardcodedAlbums = albums.filter(album => album.id.startsWith('default-'));
    
    // Filter out duplicates (albums that are already hardcoded)
    const filteredExtractedAlbums = extractedAlbums.filter(extractedAlbum => 
      !hardcodedAlbums.some(hardcoded => 
        hardcoded.name === extractedAlbum.name && hardcoded.artist === extractedAlbum.artist
      )
    );
    
    setAlbums([...hardcodedAlbums, ...filteredExtractedAlbums]);
    
    // Handle artists (your existing code)
    const hasArtists = await fetchArtistsFromAPI();
    if (!hasArtists && loadedSongs.length > 0) {
      const extractedArtists = extractArtistsFromSongs(loadedSongs);
      setArtists(extractedArtists);
    }
  };
  
  loadData();
}, []);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchFavorites(user.userId);
    } else {
      resetFavorites();
    }
  }, [isLoggedIn, user, songs]);

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your frozen beats...</p>
      </div>
    );
  }

  // ========== RENDER ==========
  return (
    <div className="app-container">
      <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            if (page === "home") {
              setSelectedArtist(null);
              setSelectedAlbum(null);
            }
          }}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogoutClick}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}  // ADD THIS
          queueLength={queue.length}
          onOpenQueue={handleOpenQueue}
          favoritesCount={favorites.length}
        />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''} ${(isQueueOpen) ? 'with-queue' : ''}`}>
        <Header
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearch={() => {
            setSearchQuery(searchInput);
            setCurrentPage("search");
          }}
          onClearSearch={() => {
            setSearchInput("");
            setSearchQuery("");
          }}
          isLoggedIn={isLoggedIn}
          username={user?.username}
          isAdmin={user?.role === 'admin'}
        />

        {(error || authError) && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error || authError}</span>
          </div>
        )}

        {currentSong && (
          <div className="now-playing-card frozen-card">
            <div className="now-playing-content">
              <div className="now-playing-image">
                <img src={currentSong.coverUrl} alt={currentSong.title} />
              </div>
              <div>
                <p className="now-playing-label">❄️ NOW PLAYING</p>
                <h2 className="now-playing-title">{currentSong.title}</h2>
                <div className="now-playing-container">
                    <div className="scroll-track">
                      <p className="now-playing-meta">
                        {currentSong.artist} • {currentSong.album}
                      </p>
                    </div>
                  </div>
                <div className="controls">
                  <button onClick={playPrevious} className="control-button">
                    <SkipBack size={20} />
                  </button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="play-button">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button onClick={playNext} className="control-button">
                    <SkipForward size={20} />
                  </button>
                </div>
                {queue.length > 0 && currentQueueIndex >= 0 && (
                  <p className="queue-info">Queue: {currentQueueIndex + 1} of {queue.length}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentPage === "home" && (
          <>
            <TrendingSlider
              trendingSongs={trendingSongs}
              sliderIndex={sliderIndex}
              onPrevSlide={() => setSliderIndex((prev) => (prev - 1 + trendingSongs.length) % trendingSongs.length)}
              onNextSlide={() => setSliderIndex((prev) => (prev + 1) % trendingSongs.length)}
              onPlay={handlePlaySong}
            />
            <ArtistGrid 
              artists={artists.slice(0, 10)} 
              onSelectArtist={(artist) => {
                setSelectedArtist(artist);
                setCurrentPage("artist");
              }} 
            />
            <div>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>❄️ Popular Tracks</h2>
              <SongGrid
                songs={[...songs].sort((a, b) => b.plays - a.plays).slice(0, 6)}
                favorites={favorites}
                onPlay={handlePlaySong}
                onToggleFavorite={handleToggleFavorite}
                onAddToQueue={addToQueue}
              />
            </div>
              <AlbumGrid albums={albums.slice(0,16)} onSelectAlbum={(album) => {
              setSelectedAlbum(album);
              setCurrentPage("album");
            }} 
            />
          </>
        )}

        {currentPage === "artist" && selectedArtist && (
          <ArtistPage
            artist={selectedArtist}
            songs={songs}
            favorites={favorites}
            onBack={() => setCurrentPage("home")}
            onPlay={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={addToQueue}
          />
        )}

        {currentPage === "album" && selectedAlbum && (
          <AlbumPage
            album={selectedAlbum}
            songs={songs}
            favorites={favorites}
            onBack={() => setCurrentPage("home")}
            onPlay={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === "search" && (
        <SearchPage
          query={searchQuery}
          songs={songs}
          artists={artists}
          albums={albums}
          favorites={favorites}
          onPlay={handlePlaySong}
          onToggleFavorite={handleToggleFavorite}
          onAddToQueue={addToQueue}
          onSelectArtist={(artist) => {
            setSelectedArtist(artist);
            setCurrentPage("artist");
          }}
          onSelectAlbum={(album) => {
            setSelectedAlbum(album);
            setCurrentPage("album");
          }}
        />
      )}

        {currentPage === "favorites" && (
          <FavoritesPage
            favorites={favorites}
            onPlay={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={addToQueue}
          />
        )}


    {currentPage === "login" && !isLoggedIn && (
  <AuthModal
    mode={authMode}
    onModeChange={setAuthMode}
    loginEmail={loginEmail}
    setLoginEmail={setLoginEmail}
    loginPassword={loginPassword}
    setLoginPassword={setLoginPassword}
    registerUsername={registerUsername}
    setRegisterUsername={setRegisterUsername}
    registerEmail={registerEmail}
    setRegisterEmail={setRegisterEmail}
    registerPassword={registerPassword}
    setRegisterPassword={setRegisterPassword}
    otp={otp}
    setOtp={setOtp}
    showOtpInput={showOtpInput}
    error={authError}
    isLoading={isLoading}
    onLogin={handleLoginClick}
    onRegister={handleRegister}
    onVerifyOtp={handleVerifyOtpAndRedirect}
    onResendOtp={handleResendOtp}
    onGuestContinue={() => setCurrentPage("home")}
    onForgotPassword={handleForgotPassword}
    showForgotPassword={showForgotPassword}
    forgotPasswordEmail={forgotPasswordEmail}
    setForgotPasswordEmail={setForgotPasswordEmail}
    onSendResetOtp={handleSendResetOtp}
    onBackToLogin={handleBackToLogin}
    showResetPassword={showResetPassword}
    resetPasswordOtp={resetPasswordOtp}
    setResetPasswordOtp={setResetPasswordOtp}
    newPassword={newPassword}
    setNewPassword={setNewPassword}
    onResetPassword={handleResetPassword}
    isResettingPassword={isResettingPassword}
  />
)}
      </div>

      <NowPlayingBar
      currentSong={currentSong}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onNext={playNext}
      onPrevious={playPrevious}
      volume={volume}
      onVolumeChange={setVolume}
      currentTime={currentTime}
      duration={duration}
      formatTime={formatTime}
      audioRef={audioRef}
      sidebarCollapsed={sidebarCollapsed}
      isQueueOpen={isQueueOpen}
    />

      <audio ref={audioRef} />

      <QueueModal
        isOpen={isQueueOpen}
        onClose={handleCloseQueue}
        queue={queue}
        currentSong={currentSong}
        currentQueueIndex={currentQueueIndex}
        onPlaySong={playSong}
        onRemoveFromQueue={removeFromQueue}
        onClearQueue={clearQueue}
        onReorderQueue={reorderQueue}
      />

      <ChangePasswordModal
      isOpen={isChangePasswordOpen}
      onClose={() => setIsChangePasswordOpen(false)}
      userId={user?.userId}
      token={typeof window !== 'undefined' ? localStorage.getItem('token') : null}
      />

    </div>
  );
}