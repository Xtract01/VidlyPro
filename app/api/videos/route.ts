import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

import { NextRequest, NextResponse } from "next/server";

/* =========================
   GET: Fetch all videos
========================= */
export async function GET() {
  try {
    await connectToDatabase();

    const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

    if (!videos.length) {
      return NextResponse.json(
        { message: "No videos found." },
        { status: 404 }
      );
    }

    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   POST: Create a new video
========================= */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body: IVideo = await request.json();

    const { title, description, videoUrl, thumbnailUrl } = body;

    if (!title || !description || !videoUrl || !thumbnailUrl) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const videoData: Partial<IVideo> = {
      ...body, // ✅ fixed spread
      controls: body.controls ?? true,
      transformation: {
        width: 1080,
        height: 1020,
        quality: body.transformation?.quality ?? 100,
      },
    };

    const newVideo = await Video.create(videoData);

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
