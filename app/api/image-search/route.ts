import { NextRequest, NextResponse } from "next/server";
import { handleImage } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const imageName = body.imageName || body.url || "honey.png";
      const result = await handleImage(imageName);
      return NextResponse.json({ success: true, message: result });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const fileName = file?.name || "honey.png";
      const result = await handleImage(fileName);
      return NextResponse.json({ success: true, message: result });
    }

    const defaultResult = await handleImage("honey.png");
    return NextResponse.json({ success: true, message: defaultResult });
  } catch (error) {
    console.error("Image search API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing image." },
      { status: 500 }
    );
  }
}
