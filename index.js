const Jimp = require("jimp");
const chalk = require("chalk");
const isImage = require("is-image");
const figlet = require("figlet");
const inquirer = require("inquirer");
//
const introText = "MJ Generator";
const currentFolder = "./";
const exportFolder = "export/";
const fs = require("fs");
const importImage = "import/001.jpg";
const imgLogo = "import/trinhxinhgai.png";
const imgActive = "active/image.jpg";
const imgExported = "export/image1.jpg";
const xCorrdinate = 180;
const yCorrdinate = 748;
const width = 885;
const height = 1454;

// init
function init() {
  console.log(
    chalk.green(
      figlet.textSync(introText, {
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
  console.log(chalk.red("Starting...."));
}
// get image files
async function getImageFiles() {
  var files = fs.readdirSync(currentFolder);
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (isImage(file)) {
      var result = await askDescriptionImage(file);
      await mergeImages(file, result.description);
    }
  }
}
// merge images
async function mergeImages(fileName, description) {
  return await Jimp.read(currentFolder + fileName)
    .then(jimpImage => {
      jimpImage.clone().write(imgActive);
    })
    .then(() => {
      return Jimp.read(imgActive);
    })
    .then(imageActive => {
      return Jimp.read(imgLogo).then(logo => {
        logo.resize(width, height);
        var mergeImage = imageActive.composite(logo, xCorrdinate, yCorrdinate, [
          Jimp.BLEND_DESTINATION_OVER,
          1,
          1
        ]);
        return mergeImage;
      });
    })
    .then(finalImage => {
      finalImage.quality(100).write(exportFolder + fileName);
      console.log("Merged image!!!");
    })
    .catch(error => {
      console.error(error);
    });
}
// ask title for image
async function askDescriptionImage(fileName) {
  return inquirer.prompt([
    {
      name: "description",
      type: "input",
      message: "What's description for " + fileName + "?"
    }
  ]);
}
// run program
async function run() {
  init();
  await getImageFiles();
  console.log("Done");
}
run();
