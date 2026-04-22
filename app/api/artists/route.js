export const runtime = "nodejs";

import client from "@/lib/mongodb";

// GET - Fetch all artists (merge from songs and artists collection)
export async function GET() {
    try {
        await client.connect();
        const db = client.db("FrozenBeats");
        const artistsCollection = db.collection("artists");
        const songsCollection = db.collection("songs");
        
        // Get all artists from artists collection
        const customArtists = await artistsCollection.find({}).toArray();
        
        // Get all songs to extract artists
        const allSongs = await songsCollection.find({}).toArray();
        
        // Create sets to track artists
        const customArtistNames = new Set(customArtists.map(a => a.name));
        
        // Helper function for random followers
        const getRandomFollowers = () => {
            return Math.floor(Math.random() * 1000000).toLocaleString();
        };
        
        // FIRST: Extract artists from songs (handle multiple artists)
        const songOnlyArtists = [];
        const processedArtists = new Set();
        
        allSongs.forEach(song => {
            // Get artists array or fallback to split the string
            let artistNames = song.artists;
            if (!artistNames && song.artist) {
                // Split comma-separated string and trim
                artistNames = song.artist.split(',').map(a => a.trim());
            }
            
            if (artistNames && Array.isArray(artistNames)) {
                artistNames.forEach(artistName => {
                    if (!customArtistNames.has(artistName) && !processedArtists.has(artistName)) {
                        processedArtists.add(artistName);
                        songOnlyArtists.push({
                            id: `song-${artistName.toLowerCase().replace(/\s/g, '-')}`,
                            name: artistName,
                            image: song.coverUrl,
                            followers: getRandomFollowers()
                        });
                    }
                });
            }
        });
        
        // SECOND: Add custom artists (from artists collection)
        const customArtistsList = customArtists.map(artist => ({
            id: artist._id.toString(),
            name: artist.name,
            image: artist.imageUrl,
            followers: getRandomFollowers()
        }));
        
        // Combine: Song-only artists first, then custom artists
        const mergedArtists = [...songOnlyArtists, ...customArtistsList];
        
        return Response.json(mergedArtists);
        
    } catch (error) {
        console.error("Error fetching artists:", error);
        return Response.json({ error: "Failed to fetch artists" }, { status: 500 });
    }
}