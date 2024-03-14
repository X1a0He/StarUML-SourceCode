const path = require("path");

const IMAGE_MAX_WIDTH = 500;
const IMAGE_MAX_HEIGHT = 500;

function imageToDataURL(file, callback) {
  const ext = path.extname(file).toLowerCase();

  console.log("ext", ext);

  let mimeType = "image/jpeg";
  if (ext === ".png") mimeType = "image/png";
  if (ext === ".svg") mimeType = "image/svg+xml";
  const img = new Image();
  img.src = file;
  img.onload = () => {
    let w = img.width;
    let h = img.height;
    if (w > h && w > IMAGE_MAX_WIDTH) {
      h = Math.round(h * (IMAGE_MAX_WIDTH / w));
      w = IMAGE_MAX_WIDTH;
    }
    if (h > w && h > IMAGE_MAX_HEIGHT) {
      w = Math.round(w * (IMAGE_MAX_HEIGHT / h));
      h = IMAGE_MAX_HEIGHT;
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const data = canvas.toDataURL(mimeType);
    if (callback) {
      callback({
        originalWidth: img.width,
        originalHeight: img.height,
        width: w,
        height: h,
        data: data,
      });
    }
  };
}

/**
 * @private
 * Convert image file to HTML image element
 * @param file
 * @returns {HTMLImageElement} HTML image element with data-url
 */
function fileToImageElement(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", () => {
      const dataUrl = reader.result;
      let image = new Image();
      image.src = dataUrl;
      image.onload = () => {
        resolve(image);
      };
    });
  });
}

exports.imageToDataURL = imageToDataURL;
exports.fileToImageElement = fileToImageElement;
