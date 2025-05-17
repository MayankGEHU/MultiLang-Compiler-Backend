const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];

  const outPath = path.join(outputPath, `${jobId}.exe`);

  //Compiles the file 
  return new Promise((resolve, reject) => {

    //only run the program if it compiles successfully.
    const command = `g++ "${filepath}" -o "${outPath}" && "${outPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
};

module.exports = {
  executeCpp,
};
