// app/types/index.ts
export type Page = "home" | "artist" | "album" | "search" | "login" | "favorites";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  plays: number;
  duration?: string;
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