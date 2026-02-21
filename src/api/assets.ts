import { existsSync, mkdirSync } from "fs";
import type { ApiConfig } from "../config";
import path from "path";
import { randomBytes } from "crypto";

export function ensureAssetsDir(cfg: ApiConfig) {
  if (!existsSync(cfg.assetsRoot)) {
    mkdirSync(cfg.assetsRoot, { recursive: true });
  }
}

export function mediaTypeToExt(mediaType: string) {
  const idx = mediaType.indexOf("/")

  // Edge case with indexOf - If the / is at position 0 (like /png), indexOf returns 0, which is falsy in JavaScript. Your check if (!idx) would throw an error even though a / was found. A safer check would be:
  // if (!idx) {
  //   throw new Error("MediaType string is malformed")
  // }

  if (idx === -1) {
    return ".bin"
  }
  const ext = mediaType.slice(idx + 1)

  console.log("ext ", ext)
  // pre-pend "." before file extension
  return `.${ext}`;
}

export function getAssetDiskPath(cfg: ApiConfig, filePath: string) {
  
  // if (!cfg) {
  //   throw new Error("Config object malformed")
  // }
  
  return path.join(cfg.assetsRoot, filePath)
}

export function getAssetURL(cfg: ApiConfig, filePath: string) {
  
  // if (!cfg) {
  //   throw new Error("Config object malformed")
  // }

  // `http://localhost:${cfg.port}/assets/${videoId}${fileExtension}`

  return `http://localhost:${cfg.port}/assets/${filePath}`
}

export async function getBase64FileName() {
  try {
    const buff = randomBytes(32)
    let base64FileName = buff.toString("base64")

    console.log("base64FileName ", base64FileName)
    return base64FileName
  } catch(err) {
    console.log("Error occured ")
    throw new Error("Error occured, failed to write bytes()")
  }
}