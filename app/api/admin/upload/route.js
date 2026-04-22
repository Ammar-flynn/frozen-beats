export const runtime = "nodejs";

import client from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        // Get authorization header
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "No token provided" }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check admin role
        if (decoded.role !== 'admin') {
            return Response.json({ error: "Admin access required" }, { status: 403 });
        }
        
        // Process upload
        const formData = await req.formData();

        const title = formData.get("title");
        const artistString = formData.get("artist");
        const album = formData.get("album");
        const audioFile = formData.get("audio");
        const coverFile = formData.get("cover");

        if (!audioFile || !coverFile) {
            return Response.json({ error: "Audio and cover files are required" }, { status: 400 });
        }

        // Split artists by comma and trim whitespace
        const artistsList = artistString.split(',').map(a => a.trim());

        const uploadToCloudinary = async (file, folder) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder, resource_type: "auto" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
        };

        const deleteFromCloudinary = async (imageUrl) => {
            if (!imageUrl) return;
            try {
                const parts = imageUrl.split('/');
                const filename = parts.pop();
                const folder = parts.pop();
                const publicId = `${folder}/${filename.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
                console.log(`🗑️ Deleted: ${publicId}`);
                return true;
            } catch (error) {
                console.error("Failed to delete image:", error);
                return false;
            }
        };

        const audioUpload = await uploadToCloudinary(audioFile, "songs");
        
        await client.connect();
        const db = client.db("FrozenBeats");
        const songs = db.collection("songs");
        const artists = db.collection("artists");

        // ========== CHECK IF ALBUM ALREADY EXISTS ==========
        const existingAlbumSong = await songs.findOne({ album: album });
        
        let albumCoverUrl = null;
        let isNewAlbum = false;
        
        if (existingAlbumSong && existingAlbumSong.albumCoverUrl) {
            // Album exists - reuse existing cover (NO upload)
            albumCoverUrl = existingAlbumSong.albumCoverUrl;
            console.log(`📀 Using existing album cover for "${album}"`);
        } else {
            // New album - upload the cover image
            const coverUpload = await uploadToCloudinary(coverFile, "covers");
            albumCoverUrl = coverUpload.secure_url;
            isNewAlbum = true;
            console.log(`🆕 New album cover uploaded for "${album}"`);
        }

        // ========== PROCESS ARTISTS ==========
        const createdArtists = [];
        const updatedArtists = [];
        
        for (const artistName of artistsList) {
            // Check if artist cover was provided in the form
            const artistCoverFile = formData.get(`artistCover_${artistName}`);
            let artistCoverUrl = null;
            
            if (artistCoverFile && artistCoverFile.size > 0) {
                const artistCoverUpload = await uploadToCloudinary(artistCoverFile, "artists");
                artistCoverUrl = artistCoverUpload.secure_url;
            }
            
            const existingArtist = await artists.findOne({ name: artistName });
            
            if (!existingArtist) {
                // Create new artist
                const newArtist = {
                    name: artistName,
                    imageUrl: artistCoverUrl || albumCoverUrl,
                    bio: "",
                    socialLinks: {},
                    songCount: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await artists.insertOne(newArtist);
                createdArtists.push(artistName);
                console.log(`✅ Auto-created artist: ${artistName}`);
            } else {
                // Artist exists - update
                const updateData = {
                    $inc: { songCount: 1 },
                    $set: { updatedAt: new Date() }
                };
                
                // If new artist cover uploaded, delete old and update
                if (artistCoverFile && artistCoverFile.size > 0) {
                    if (existingArtist.imageUrl) {
                        await deleteFromCloudinary(existingArtist.imageUrl);
                    }
                    updateData.$set.imageUrl = artistCoverUrl;
                    console.log(`🖼️ Updated artist image for: ${artistName}`);
                }
                
                await artists.updateOne({ name: artistName }, updateData);
                updatedArtists.push(artistName);
                console.log(`📈 Updated song count for artist: ${artistName}`);
            }
        }

        // Insert the song with BOTH albumCoverUrl AND coverUrl
        const result = await songs.insertOne({
            title,
            artist: artistString,
            artists: artistsList,
            album,
            albumCoverUrl,
            coverUrl: albumCoverUrl,  
            audioUrl: audioUpload.secure_url,
            plays: 0,
            createdAt: new Date()
        });

        return Response.json({ 
            success: true, 
            message: "Song uploaded successfully",
            isNewAlbum,
            artists: {
                created: createdArtists,
                updated: updatedArtists,
                all: artistsList
            }
        });
        
    } catch (error) {
        console.error("Upload error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return Response.json({ error: "Invalid token" }, { status: 401 });
        }
        
        return Response.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}