import client from "@/lib/mongodb";

export async function POST(req) {
  const body = await req.json();

  await client.connect();

  const db = client.db("musicdb");
  const songs = db.collection("songs");

  const result = await songs.insertOne(body);

  return Response.json(result);
}