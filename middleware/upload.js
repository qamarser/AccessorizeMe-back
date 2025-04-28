import multer from "multer";
import path from "path";

// Define where and how images will be stored temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

export const uploadSingle = multer({ storage }).single("image"); // for categories
export const uploadSingleBackgroundImage = multer({ storage }).single("background_image"); // for categories with background_image field
export const uploadMultiple = multer({ storage }).array("images", 5); // for products
export const uploadAny = multer({ storage }).any(); // accept any file fields
