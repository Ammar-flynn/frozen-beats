export const runtime = "nodejs";

import { NextResponse } from "next/server";
import client from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    await client.connect();
    const db = client.db("FrozenBeats");
    const Users = db.collection("users");
    const PasswordReset = db.collection("password_resets");

    // Check if user exists
    const user = await Users.findOne({ email: email });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old entries
    await PasswordReset.deleteMany({ email: email });

    // Store new OTP
    await PasswordReset.insertOne({
      email,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your New FrozenBeats Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #0A74DA;">New Password Reset OTP ❄️</h2>
          <p>Your new OTP for password reset is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #0A74DA; padding: 20px; text-align: center; background: #f0f0f0; border-radius: 8px; letter-spacing: 4px;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: "New OTP sent to your email"
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}