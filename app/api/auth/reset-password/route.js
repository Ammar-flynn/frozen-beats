export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Reset password request for:", body.email);

    await client.connect();
    const db = client.db("FrozenBeats");
    const Users = db.collection("users");
    const PasswordReset = db.collection("password_resets");

    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find the OTP entry
    const resetEntry = await PasswordReset.findOne({ 
      email: email, 
      otp: otp 
    });
    
    if (!resetEntry) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (resetEntry.expiresAt && new Date() > new Date(resetEntry.expiresAt)) {
      await PasswordReset.deleteOne({ _id: resetEntry._id });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await Users.findOne({ email: email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await Users.updateOne(
      { email: email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    // Delete the reset OTP entry
    await PasswordReset.deleteOne({ _id: resetEntry._id });

    console.log(`Password reset successfully for: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: "Password reset successfully. Please login with your new password."
    }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}