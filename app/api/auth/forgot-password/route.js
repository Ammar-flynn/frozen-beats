export const runtime = "nodejs";

import { NextResponse } from "next/server";
import client from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Forgot password request for:", body.email);

    await client.connect();
    const db = client.db("FrozenBeats");
    const Users = db.collection("users");
    const PasswordReset = db.collection("password_resets");

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await Users.findOne({ email: email });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated password reset OTP for ${email}: ${otp}`);

    // Delete any existing reset requests for this email
    await PasswordReset.deleteMany({ email: email });

    // Store OTP in database
    await PasswordReset.insertOne({
      email,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    });

    // Send email with OTP
    try {
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
        subject: "Reset Your FrozenBeats Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #0A74DA;">Password Reset Request ❄️</h2>
            <p>You requested to reset your password. Your OTP is:</p>
            <div style="font-size: 32px; font-weight: bold; color: #0A74DA; padding: 20px; text-align: center; background: #f0f0f0; border-radius: 8px; letter-spacing: 4px;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Frozen Beats - Your Music Streaming Platform</p>
          </div>
        `
      });
      
      console.log(`Password reset OTP email sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent to your email",
      email: email 
    }, { status: 200 });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}