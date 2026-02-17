import { getBearerToken, validateJWT } from "../auth";
import { respondWithJSON } from "./json";
import { getVideo, updateVideo } from "../db/videos";
import type { ApiConfig } from "../config";
import type { BunRequest } from "bun";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors";

type Thumbnail = {
  data: ArrayBuffer;
  mediaType: string;
};

const videoThumbnails: Map<string, Thumbnail> = new Map();

export async function handlerGetThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { videoId } = req.params as { videoId?: string };
  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const video = getVideo(cfg.db, videoId);
  if (!video) {
    throw new NotFoundError("Couldn't find video");
  }

  const thumbnail = videoThumbnails.get(videoId);
  if (!thumbnail) {
    throw new NotFoundError("Thumbnail not found");
  }

  return new Response(thumbnail.data, {
    headers: {
      "Content-Type": thumbnail.mediaType,
      "Cache-Control": "no-store",
    },
  });
}

export async function handlerUploadThumbnail(cfg: ApiConfig, req: BunRequest) {
  const MAX_UPLOAD_SIZE: number = 10 << 20;

  const { videoId } = req.params as { videoId?: string };
  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  console.log("uploading thumbnail for video", videoId, "by user", userID);

  // TODO: implement the upload here
  const formData = await req.formData()
  console.log("formData ", formData);
  const thumbnail = formData.get("thumbnail")
  console.log("thumbnail ", thumbnail)


  if (!(thumbnail instanceof File)) {
    throw new BadRequestError("Could not get thumbnail file")
  }

  if (thumbnail.size > MAX_UPLOAD_SIZE) { throw new BadRequestError("File size too big!") }

  const mediaType = thumbnail.type;

  const data = await thumbnail.arrayBuffer();

  console.log("data bytelength ", data.byteLength)
  console.log("data ", data.byteLength)
  console.log(new Uint8Array(data).slice(0,8))

  const video = getVideo(cfg.db, videoId)

  if (!video) {
    throw new NotFoundError("Could not video ")
  }

  if (video.userID !== userID) {
    throw new UserForbiddenError("Not authorized")
  }

  videoThumbnails.set(videoId, {data, mediaType})

  video.thumbnailURL = `http://localhost:${cfg.port}/api/thumbnails/${videoId}`

  updateVideo(cfg.db, video)

  return respondWithJSON(200, video);
}
