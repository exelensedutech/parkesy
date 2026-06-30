import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { accessToken } = await request.json();
  if (!accessToken || typeof accessToken !== "string") {
    return NextResponse.json({ verified: false, error: "Missing access token" }, { status: 400 });
  }

  const msg91Response = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authkey: process.env.MSG91_AUTH_KEY,
      "access-token": accessToken,
    }),
  });

  const result = await msg91Response.json();
  // MSG91's success/failure response shape isn't fully documented anywhere we
  // could verify ahead of time — this checks the `type` field pattern used
  // elsewhere in their widget API and logs the raw response so the real shape
  // can be confirmed against actual traffic in the Vercel function logs.
  const verified = result?.type === "success";
  if (!verified) {
    console.error("MSG91 OTP verification did not succeed:", result);
  }

  return NextResponse.json({ verified });
}
