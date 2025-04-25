import {Image} from "../config/db.js";
import { uploadToImgBB } from "../utils/uploadToImgBB.js";

export const uploadImages = async (req, res) => {
  try {
    const { related_type, related_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    if (!["product", "productColor"].includes(related_type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid related_type" });
    }

    const uploadedImages = [];

    for (const file of files) {
      const imageUrl = await uploadToImgBB(file.path);
      const imageRecord = await Image.create({
        related_type,
        related_id,
        image_url: imageUrl,
      });
      uploadedImages.push(imageRecord);
    }

    res.status(201).json({ success: true, data: uploadedImages });
  } catch (error) {
    console.error("Image Upload Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
