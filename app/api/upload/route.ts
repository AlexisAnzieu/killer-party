import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs'; // Required for file uploads

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const gameId = formData.get('gameId') as string | null;
    const name = formData.get('name') as string | null;

    if (!file || !gameId || !name) {
      return NextResponse.json({ error: 'No file, gameId, or name provided' }, { status: 400 });
    }

    const sanitizedName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const notification_url = process.env.CLOUDINARY_WEBHOOK_URL;

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `killer-game/${gameId}`,
          public_id: sanitizedName, // Use sanitized name as the file name
          ...(notification_url ? { notification_url } : {})
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
