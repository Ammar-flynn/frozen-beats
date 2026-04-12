import client from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
    const formData = await req.formData();

    const title = formData.get("title");
    const artist = formData.get("artist");
    const album = formData.get("album");
    const audioFile = formData.get("audio");
    const coverFile = formData.get("cover");

    if (!audioFile || !coverFile) {
         return Response.json({ error: "Audio and cover files are required" }, { status: 400 });
    }

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

    const audioUpload = await uploadToCloudinary(audioFile, "songs");
    const coverUpload = await uploadToCloudinary(coverFile, "covers");

    await client.connect();
    const db = client.db("FrozenBeats");
    const songs = db.collection("songs");

    const result = await songs.insertOne({
    title,
    artist,
    album,
    audioUrl: audioUpload.secure_url,
    coverUrl: coverUpload.secure_url,
    plays: 0
    });

    return Response.json(result);
}

