const multer = require("multer");

const storage = multer.memoryStorage(); // Lưu file tạm trong RAM
const upload = multer({ storage });

module.exports = upload;
