import { NextResponse, type NextRequest } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs"; // Required for file uploads

const MAX_UPLOAD_IMAGE_BYTES = 100 * 1024;
const IMAGE_MAX_DIMENSIONS = [
  1024, 768, 640, 512, 384, 320, 256, 192, 160, 128, 96,
];
const IMAGE_COMPRESSION_QUALITIES = [82, 74, 66, 58, 50, 42, 34, 26, 18, 10];

async function resizeImageToUnder100Kb(buffer: Buffer) {
  if (buffer.byteLength < MAX_UPLOAD_IMAGE_BYTES) {
    return buffer;
  }

  for (const maxDimension of IMAGE_MAX_DIMENSIONS) {
    for (const quality of IMAGE_COMPRESSION_QUALITIES) {
      const resizedBuffer = await sharp(buffer, { failOn: "none" })
        .rotate()
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      if (resizedBuffer.byteLength < MAX_UPLOAD_IMAGE_BYTES) {
        return resizedBuffer;
      }
    }
  }

  throw new Error("Unable to resize image below 100 KB");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const gameId = formData.get("gameId") as string | null;
    const name = formData.get("name") as string | null;

    if (!file || !gameId || !name) {
      return NextResponse.json(
        { error: "No file, gameId, or name provided" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Uploaded file must be an image" },
        { status: 400 },
      );
    }

    const sanitizedName = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = await resizeImageToUnder100Kb(Buffer.from(arrayBuffer));

    const notification_url = process.env.CLOUDINARY_WEBHOOK_URL;

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `killer-game/${gameId}`,
              public_id: sanitizedName, // Use sanitized name as the file name
              resource_type: "image",
              ...(notification_url ? { notification_url } : {}),
            },
            (error, result) => {
              if (error || !result)
                return reject(error || new Error("Upload failed"));
              resolve(result);
            },
          )
          .end(buffer);
      },
    );

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
