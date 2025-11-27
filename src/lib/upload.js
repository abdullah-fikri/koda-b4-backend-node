
import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".")[file.originalname.split(".").length - 1].toLowerCase(); 
    cb(null, `${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowed = ["jpeg", "png", "jpg"];
    const ext = file.originalname.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      return cb(new Error("extension not support"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 1 }, 
});

export default upload;
