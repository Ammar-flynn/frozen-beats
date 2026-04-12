import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/mongodb";

export async function POST(req) {
  const body = await req.json();

  await client.connect();
  const db = client.db("FrozenBeats");
  const Users  = db.collection("users");
  
  const { username, email, password } = body;

  const entry = await Users.findOne({ email: email });

  if(entry != null){
    return Response.json({ error: "Email already registered" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await Users.insertOne({
    username,
    email,
    password: hashedPassword,
    role: "user"
  });

  return Response.json(result);
}