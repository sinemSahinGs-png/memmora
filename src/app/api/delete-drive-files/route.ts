import { NextResponse } from "next/server";
import {
  requireCoupleAdminOrSuperAdmin,
  requireSuperAdmin,
} from "@/lib/auth/admin-session-cookie";
import {
  deleteDriveFile,
  getMissingDriveEnvVars,
} from "@/lib/google/drive";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fileIds?: string[];
      coupleSlug?: string;
    };
    const fileIds = (body.fileIds ?? []).filter(Boolean);
    const coupleSlug = body.coupleSlug?.trim();

    if (coupleSlug) {
      const auth = await requireCoupleAdminOrSuperAdmin(coupleSlug);
      if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }
    } else {
      const auth = await requireSuperAdmin();
      if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }
    }

    if (fileIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    const missingEnv = getMissingDriveEnvVars();
    if (missingEnv.length > 0) {
      console.error("[delete-drive-files] missing env:", missingEnv.join(", "));
      return NextResponse.json(
        { error: "Google Drive yapılandırması eksik." },
        { status: 500 },
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
      { status: 500 },
    );
  }
}
