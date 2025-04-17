import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./Cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "rides",
        allowed_formats: ["jpg", "png", "jpeg", "gif", "webp", "mp4"],
    },
});

const upload = multer({ storage });
export default upload;
