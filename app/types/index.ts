// app/types/index.ts
export type Page = "home" | "artist" | "album" | "search" | "login" | "favorites";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  artists?: string[];
  album: string;
  albumCoverUrl: string;
  coverUrl?: string;    
  audioUrl: string;
  plays: number;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followers: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  image: string;
  year: string;
  songs: number;
}