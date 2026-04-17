import client from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        const body = await req.json();
        await client.connect();
        const db = client.db("FrozenBeats");
        const Users = db.collection("users");

        const { email, password } = body;

        const entry = await Users.findOne({ email: email });

        if (!entry) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        const compared = await bcrypt.compare(password, entry.password);

        if (!compared) {
            return Response.json({ error: "Invalid Password" }, { status: 400 });
        }

        const userRole = entry.role || "user";

        const token = jwt.sign(
            { 
                userId: entry._id.toString(), 
                role: userRole,
                username: entry.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return as JSON object
        return Response.json({ success: true, token });
        
    } catch (error) {
        console.error("Login error:", error);
        return Response.json({ error: "Login failed" }, { status: 500 });
    }
}
