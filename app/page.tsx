"use client";

import { useState } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Share2,
  Volume2,
  Repeat,
  Shuffle,
  Search,
  Home as HomeIcon,
  Library,
  User,
  Mic2,
  Sparkles
} from "lucide-react";

// Sample music data
const songs = [
  {
    id: 1,
    title: "Frozen Heart",
    artist: "Elsa Melody",
    album: "Winter Tales",
    duration: "3:45",
    cover: "https://picsum.photos/id/104/200/200",
    plays: "1.2M"
  },
  {
    id: 2,
    title: "Ice Castle Dreams",
    artist: "Snow Symphony",
    album: "Frozen Echoes",
    duration: "4:12",
    cover: "https://picsum.photos/id/15/200/200",
    plays: "892K"
  },
  {
    id: 3,
    title: "Northern Lights",
    artist: "Aurora Vibes",
    album: "Arctic Nights",
    duration: "3:58",
    cover: "https://picsum.photos/id/96/200/200",
    plays: "2.1M"
  },
  {
    id: 4,
    title: "Crystal Waters",
    artist: "Glacier Peak",
    album: "Melting Moments",
    duration: "4:22",
    cover: "https://picsum.photos/id/22/200/200",
    plays: "654K"
  },
  {
    id: 5,
    title: "Snowflake Waltz",
    artist: "Winter Wind",
    album: "Dance of Snow",
    duration: "3:30",
    cover: "https://picsum.photos/id/30/200/200",
    plays: "1.5M"
  },
  {
    id: 6,
    title: "Arctic Sunrise",
    artist: "Polar Dawn",
    album: "Morning Frost",
    duration: "4:05",
    cover: "https://picsum.photos/id/42/200/200",
    plays: "987K"
  }
];

export default function Home() {
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLike = (songId: number) => {
    setLikedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#0A74DA]/95 to-[#1C3E6C]/95 backdrop-blur-md border-r border-[#87CEEB]/30 shadow-2xl z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="relative">
              <img src="/Flake.jpg" className="w-8 h-8 text-[#87CEEB] animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#87CEEB] to-[#FFFFFF] bg-clip-text text-transparent frozen-glow">
              Frozen Beats
            </h1>
          </div>
          
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all">
              <Library className="w-5 h-5" />
              <span>Library</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </a>
          </nav>

          <div className="mt-8 pt-8 border-t border-[#87CEEB]/30">
            <p className="text-xs text-white/60">Your Library</p>
            <div className="mt-4 space-y-2">
              <div className="p-2 rounded-lg bg-white/10 text-white/90 text-sm backdrop-blur-sm">✨ Favorites</div>
              <div className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white/90 text-sm transition-all">❄️ Recently Played</div>
              <div className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white/90 text-sm transition-all">🎵 Playlists</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header with Search */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#87CEEB] w-4 h-4" />
            <input
              type="text"
              placeholder="Search frozen melodies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-[#87CEEB]/30 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-[#0A74DA] focus:ring-2 focus:ring-[#87CEEB]/50 w-80 text-gray-700"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white/80">Welcome back</p>
              <p className="font-semibold text-[#87CEEB] frozen-glow">❄️ Music Lover</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="frozen-card rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-xl overflow-hidden shadow-2xl ring-2 ring-[#87CEEB]/50">
              <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm text-[#0A74DA] font-semibold mb-2">❄️ NOW PLAYING</p>
              <h2 className="text-3xl font-bold text-[#1C3E6C] mb-2 frozen-glow">{currentSong.title}</h2>
              <p className="text-gray-600">{currentSong.artist} • {currentSong.album}</p>
              <div className="flex items-center gap-3 mt-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="frozen-button text-white p-3 rounded-full"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all text-[#0A74DA]">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all text-[#0A74DA]">
                  <SkipForward className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all text-[#0A74DA]">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Song Cards Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white frozen-glow">❄️ Trending Tracks</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-white">
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-white">
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="frozen-card rounded-xl p-4 cursor-pointer transition-all duration-300"
                onClick={() => {
                  setCurrentSong(song);
                  setIsPlaying(true);
                }}
              >
                <div className="relative group">
                  <img 
                    src={song.cover} 
                    alt={song.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C3E6C]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button className="frozen-button text-white p-3 rounded-full">
                      <Play className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#1C3E6C] mb-1">{song.title}</h3>
                    <p className="text-sm text-gray-500">{song.artist}</p>
                    <p className="text-xs text-[#0A74DA] mt-1 font-semibold">❄️ {song.plays} plays</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song.id);
                      }}
                      className="p-1 rounded-full hover:bg-white/50 transition"
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          likedSongs.includes(song.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-[#0A74DA]'
                        }`}
                      />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({
                            title: song.title,
                            text: `Check out ${song.title} by ${song.artist}`,
                          });
                        }
                      }}
                      className="p-1 rounded-full hover:bg-white/50 transition"
                    >
                      <Share2 className="w-5 h-5 text-[#0A74DA]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Now Playing Bar */}
        <div className="fixed bottom-0 left-64 right-0 bg-gradient-to-r from-[#0A74DA]/95 to-[#1C3E6C]/95 backdrop-blur-md border-t border-[#87CEEB]/30 p-4 shadow-2xl z-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded overflow-hidden ring-2 ring-[#87CEEB]/50">
                <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{currentSong.title}</p>
                <p className="text-xs text-white/70">{currentSong.artist}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-1 rounded-full hover:bg-white/10 transition-all text-white">
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="frozen-button text-white p-2 rounded-full"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button className="p-1 rounded-full hover:bg-white/10 transition-all text-white">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white" />
              <div className="w-24 h-1 bg-white/30 rounded-full">
                <div className="w-2/3 h-full bg-gradient-to-r from-[#87CEEB] to-[#FFFFFF] rounded-full"></div>
              </div>
              <span className="text-xs text-white/70">2:34 / 3:45</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}