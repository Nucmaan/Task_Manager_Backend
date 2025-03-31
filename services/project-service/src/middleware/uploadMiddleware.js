const multer = require("multer");
const path = require("path");

 const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "application/pdf",                
    "application/msword",           
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "application/vnd.ms-excel",     
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio, video, and document files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = {
  upload
};
