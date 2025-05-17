const fs = require("fs/promises");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");

(async () => {
  try {
    await fs.mkdir(dirCodes, { recursive: true });
  } catch (err) {
    console.error("Error creating codes directory:", err);
  }
})();

const generateFile = async (format, content) => {
  const jobId = uuid();
  const filename = `${jobId}.${format}`;
  const filepath = path.join(dirCodes, filename);
  try {
    await fs.writeFile(filepath, content);
    return filepath;
  } catch (err) {
    console.error("Error writing file:", err);
    throw err;
  }
};

module.exports = {
  generateFile,
};
