import sharp from "sharp";

interface ProcessImageOptions {
  buffer: Buffer;
  width?: number;
  height?: number;
  quality?: number;
  format?: keyof sharp.FormatEnum;
}

export async function processImage({
  buffer,
  width = 500,
  height = 500,
  quality = 80,
  format = "jpeg",
}: ProcessImageOptions): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, { quality })
    .toBuffer();
}

export async function processAvatar({
  buffer,
  width = 200,
  height = 200,
  quality = 90,
  format = "jpeg",
}: ProcessImageOptions): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, { quality })
    .toBuffer();
}

export async function processCover({
  buffer,
  width = 600,
  height = 200,
  quality = 80,
  format = "jpeg",
}: ProcessImageOptions): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, { quality })
    .toBuffer();
}

export async function processMessage({
  buffer,
  width = 500,
  height = 500,
  quality = 80,
  format = "jpeg",
}: ProcessImageOptions): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, { quality })
    .toBuffer();
}
