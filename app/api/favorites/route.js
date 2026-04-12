import client from "@/lib/mongodb";

export async function POST (req){
    const body = await req.json();

    await client.connect();

    const db = client.db("FrozenBeats");
    const Favourite = db.collection("Favourite");

    const {userId , songId} = body;

    const entry = await Favourite.findOne({ userId, songId });

    if(entry!= null){
        return Response.json({error: "Already favourited"}, {status: 380});
    }

    const result = await Favourite.insertOne({
        userId,
        songId
    });

    return Response.json(result);
}

export async function GET (req){
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    await client.connect();
    const db = client.db("FrozenBeats");
    const Favourite = db.collection("Favourite");
    
    const entry = await Favourite.find({ userId }).toArray();

    if(entry == null){
        return Response.json({error: "No Songs favourited!"} , {status: 330});
    }

    return Response.json(entry);
}