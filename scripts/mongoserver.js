const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://music-stream:musicstream123@music-stream.thwjych.mongodb.net/?appName=music-stream";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const db = client.db("musicdb");
    const songs = db.collection("songs");

    await songs.insertOne({
      title: "Espresso",
      artist: "Sabrina Carpenter",
      audioUrl: "cloudinary-url",
      coverUrl: "image-url"
    });

    console.log("Song inserted 👍");
  } finally {
    await client.close();
  }
}

run();