import { NextResponse } from "next/server";
import {
  deleteDriveFile,
  getMissingDriveEnvVars,
} from "@/lib/google/drive";

export const runtime = "nodejs";

// TODO: Add rate limiting and admin auth before production.

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { fileIds?: string[] };
    const fileIds = (body.fileIds ?? []).filter(Boolean);

    if (fileIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    const missingEnv = getMissingDriveEnvVars();
    if (missingEnv.length > 0) {
      console.error("[delete-drive-files] missing env:", missingEnv.join(", "));
      return NextResponse.json(
        { error: "Google Drive yapılandırması eksik." },
        { status: 500 }
      );
    }

    let deleted = 0;
    for (const fileId of fileIds) {
      try {
        await deleteDriveFile(fileId);
        deleted += 1;
      } catch (error) {
        console.error("[delete-drive-files]", fileId, error);
      }
    }

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("[delete-drive-files]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Drive dosyası silinemedi.",
      },
      { status: 500 }
    );
  }
}
