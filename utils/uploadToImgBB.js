// custom utility function to send an image from your server to ImgBB.
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import sharp from "sharp";

export const uploadToImgBB = async (filePath) => {
  // Convert image to WebP format using sharp
  const webpBuffer = await sharp(filePath)
    .webp({ quality: 80 })
    .toBuffer();

  const form = new FormData();
  form.append("image", webpBuffer.toString("base64"));

  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    form,
    { headers: form.getHeaders() }
  );

  return response.data.data.url; // return hosted image URL
};
