import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/mongodb";
import jwt from  "jsonwebtoken";

export async function POST (req){
    const body = await req.json();
    await client.connect();
    const db = client.db("FrozenBeats");
    const Users = db.collection("users");

    const {email , password} = body;

    const entry = await Users.findOne({email : email});

    if (!entry) {
         return Response.json({ error: "User not found" }, { status: 404 });
    }

    const compared = await bcrypt.compare(password , entry.password);

    if(!compared){
         return Response.json({ error: "Invallid Password" }, { status: 400 });
    }

    const token = jwt.sign(
        { userId: entry._id, role: entry.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return Response.json(token);
} 