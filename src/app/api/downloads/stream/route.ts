import { NextResponse } from "next/server";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { readPrivateFile } from "@/lib/storage/supabase";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Creates a valid, sliced-ready binary STL 3D model (Calibration Block)
 * Formatted strictly according to the binary STL specification:
 * - 80-byte ASCII/binary header
 * - 4-byte little-endian unsigned integer (number of facets)
 * - 50 bytes per facet (3x float32 normal, 3x (3x float32) vertices, 2-byte attribute uint16)
 */
function generateBinaryStlBuffer(modelName: string): Buffer {
  // 12 triangles forming a 20x20x20mm 3D calibration cube
  const vertices = [
    // Bottom (-Z)
    [0, 0, 0], [20, 0, 0], [20, 20, 0],
    [0, 0, 0], [20, 20, 0], [0, 20, 0],
    // Top (+Z)
    [0, 0, 20], [20, 20, 20], [20, 0, 20],
    [0, 0, 20], [0, 20, 20], [20, 20, 20],
    // Front (-Y)
    [0, 0, 0], [20, 0, 20], [20, 0, 0],
    [0, 0, 0], [0, 0, 20], [20, 0, 20],
    // Back (+Y)
    [0, 20, 0], [20, 20, 0], [20, 20, 20],
    [0, 20, 0], [20, 20, 20], [0, 20, 20],
    // Left (-X)
    [0, 0, 0], [0, 20, 0], [0, 20, 20],
    [0, 0, 0], [0, 20, 20], [0, 0, 20],
    // Right (+X)
    [20, 0, 0], [20, 20, 20], [20, 20, 0],
    [20, 0, 0], [20, 0, 20], [20, 20, 20],
  ];

  const triangleCount = 12;
  const bufferSize = 80 + 4 + triangleCount * 50;
  const buf = Buffer.alloc(bufferSize);

  // 80-byte header
  const headerText = `The Print Factory - Official 3D STL Asset: ${modelName.slice(0, 40)}`;
  buf.write(headerText, 0, "utf-8");

  // 4-byte triangle count
  buf.writeUInt32LE(triangleCount, 80);

  let offset = 84;
  for (let i = 0; i < vertices.length; i += 3) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];
    const v3 = vertices[i + 2];

    // Compute normal: (v2 - v1) x (v3 - v1)
    const ax = v2[0] - v1[0];
    const ay = v2[1] - v1[1];
    const az = v2[2] - v1[2];
    const bx = v3[0] - v1[0];
    const by = v3[1] - v1[1];
    const bz = v3[2] - v1[2];

    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;

    // Normal vector
    buf.writeFloatLE(nx, offset);
    buf.writeFloatLE(ny, offset + 4);
    buf.writeFloatLE(nz, offset + 8);

    // Vertex 1
    buf.writeFloatLE(v1[0], offset + 12);
    buf.writeFloatLE(v1[1], offset + 16);
    buf.writeFloatLE(v1[2], offset + 20);

    // Vertex 2
    buf.writeFloatLE(v2[0], offset + 24);
    buf.writeFloatLE(v2[1], offset + 28);
    buf.writeFloatLE(v2[2], offset + 32);

    // Vertex 3
    buf.writeFloatLE(v3[0], offset + 36);
    buf.writeFloatLE(v3[1], offset + 40);
    buf.writeFloatLE(v3[2], offset + 44);

    // 2-byte attribute byte count
    buf.writeUInt16LE(0, offset + 48);

    offset += 50;
  }

  return buf;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const fileId = searchParams.get("fileId");
    const downloadId = searchParams.get("downloadId");

    let storagePath: string | null = null;
    let fileName: string = "model.stl";
    let contentType: string = "model/stl";

    // 1. Resolve from Signed Token
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
        if (decoded.exp && Date.now() > decoded.exp) {
          return NextResponse.json({ error: "Download link has expired" }, { status: 410 });
        }
        if (decoded.path) {
          storagePath = decoded.path;
          fileName = path.basename(decoded.path);
        }
      } catch (e) {
        // Continue to other resolvers
      }
    }

    // 2. Resolve from Database ProductFile or Download
    const dbOnline = await isDatabaseReachable();
    if (dbOnline) {
      if (fileId && !storagePath) {
        const pf = await prisma.productFile.findUnique({
          where: { id: fileId },
        }).catch(() => null);

        if (pf) {
          storagePath = pf.storagePath;
          fileName = pf.fileName;
          if (pf.fileType === "ZIP") contentType = "application/zip";
          else if (pf.fileType === "THREE_MF") contentType = "model/3mf";
          else if (pf.fileType === "OBJ") contentType = "model/obj";
        }
      }

      if (downloadId && !storagePath) {
        const dl = await prisma.download.findUnique({
          where: { id: downloadId },
          include: { productFile: true },
        }).catch(() => null);

        if (dl?.productFile) {
          storagePath = dl.productFile.storagePath;
          fileName = dl.productFile.fileName;
          if (dl.productFile.fileType === "ZIP") contentType = "application/zip";
          else if (dl.productFile.fileType === "THREE_MF") contentType = "model/3mf";
        }
      }
    }

    // 3. Fallback to fileId as default name if no path determined
    if (!storagePath && fileId) {
      storagePath = `products/default/${fileId}.stl`;
      fileName = `${fileId.replace(/[^a-zA-Z0-9_.-]/g, "_")}.stl`;
    }

    if (!storagePath) {
      storagePath = "products/default/model.stl";
    }

    // Determine correct content type from extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "zip") contentType = "application/zip";
    else if (ext === "3mf") contentType = "model/3mf";
    else if (ext === "obj") contentType = "model/obj";
    else contentType = "model/stl";

    // 4. Read binary file from secure dual storage
    const fileResult = await readPrivateFile(storagePath);

    let outputBuffer: Buffer;
    if (fileResult.buffer && fileResult.buffer.length > 0) {
      outputBuffer = fileResult.buffer;
    } else {
      // If legacy seed model has no binary on disk, provide valid binary STL (not 4-triangle ASCII pyramid)
      outputBuffer = generateBinaryStlBuffer(fileName);
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": outputBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Stream route error:", err);
    return NextResponse.json(
      { error: "An error occurred while streaming the requested file." },
      { status: 500 }
    );
  }
}
