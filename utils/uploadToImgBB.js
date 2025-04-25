// custom utility function to send an image from your server to ImgBB.
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const uploadToImgBB = async (filePath) => {
  const imageFile = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("image", imageFile.toString("base64"));

  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    form,
    { headers: form.getHeaders() }
  );

  return response.data.data.url; // return hosted image URL
};
