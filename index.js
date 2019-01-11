#!/usr/bin/env node
const Jimp = require("jimp");
const chalk = require("chalk");
const isImage = require("is-image");
const figlet = require("figlet");
const inquirer = require("inquirer");
const fs = require("fs");
//
const introText = "MJ Generator";
const currentFolder = "./";
const exportFolder = "export/";
const screenshotFrame = __dirname + "/import/official.jpg";
const activeImage = "active/image.jpg";
const xCorrdinate = 180;
const yCorrdinate = 748;
const width = 885;
const height = 1454;
let textData = {
  text: "Screenshotted by Morejump", //the text to be rendered on the image
  maxWidth: 1000, //image width - 10px margin left - 10px margin right
  maxHeight: 100, //logo height + margin
  placementX: 100, // 10px in on the x axis
  placementY: 200 //bottom of the image: height - maxHeight - margin
};

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
  console.log(chalk.yellow("Screenshots Generator by Morejump"));
  console.log(chalk.red("Starting...."));
}
// get image files
async function getImageFiles() {
  var files = fs.readdirSync(currentFolder);
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (isImage(file)) {
      var result = await askDescriptionImage(file);
      try {
        await mergeImages(file, result.description);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
// merge images
async function mergeImages(fileName, description) {
  return await Jimp.read(currentFolder + fileName)
    .then(importImage => {
      importImage.clone().write(activeImage);
    })
    .then(() => {
      return Jimp.read(activeImage);
    })
    .then(imageActive => {
      imageActive.resize(width, height);
      return Jimp.read(screenshotFrame).then(screenshotFrame => {
        var mergedImage = screenshotFrame.composite(
          imageActive,
          xCorrdinate,
          yCorrdinate,
          [Jimp.BLEND_DESTINATION_OVER, 1, 1]
        );
        return mergedImage;
      });
    }) //load font
    .then(tpl =>
      Jimp.loadFont(Jimp.FONT_SANS_128_BLACK).then(font => [tpl, font])
    )
    .then(data => {
      tpl = data[0];
      font = data[1];

      return tpl.print(
        font,
        textData.placementX,
        textData.placementY,
        {
          text: description,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        textData.maxWidth,
        textData.maxHeight
      );
    })
    .then(finalImage => {
      finalImage.quality(100).write(exportFolder + fileName);
      console.log(chalk.red("Generated screenshot!!!"));
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
      message: "What's description for " + chalk.green(fileName) + "?"
    }
  ]);
}
// run program
async function run() {
  init();
  await getImageFiles();
  console.log(chalk.green("Congratulations!!! You are done."));
}

module.exports = { run };
