const $ = (sel, el) => {
  return (el || document.body).querySelector(sel);
}

const MIME_TYPE = "image/jpeg";
let quality = parseFloat($('select[name="image-quality"]').value, 10);
let smoothingOptions = "bi-linear";
let inputHeight;
let inputWidth;
let aspectRatioPreserved = true;
let file;

const settingsButton = $('button[name="js-settings-button"]');
const settingsForm = $('form[class="js-settings-form"]');
const dragAndDropForm = $('form[name="js-box"]');

const displayInfo = (label, file, parentElement) => {
  const p = document.createElement("p");
  p.innerText = `${label} - ${readableBytes(file.size)}`;
  parentElement.append(p);
}

const displayDownloadLink = (linkText, blobData, parentElement) => {
  var downloadLink = document.createElement("a");
  downloadLink.innerText = linkText;
  let url = URL.createObjectURL(blobData);
  let copybutton = document.createElement("button");
  copybutton.innerText = "Copy Data URL";
  let dataUrl;
  blobToDataUrl(blobData)
    .then(result => {
      dataUrl = result;
    })
    .catch(error => {
      alert("There was an error converting to Data Url")
      console.log(error);
    });
  copybutton.onclick = () => {
    navigator.clipboard.writeText(dataUrl)
    // TODO: UI should reflect a successful or failed copy
  }
  parentElement.append(copybutton);

  downloadLink.href = url;
  downloadLink.download = url;
  parentElement.append(downloadLink);
}

const readableBytes = (bytes) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

const toggleElement = (element) => {
  if (element.style.display === "none") {
    element.style = ""
  } else if (element.style.display === "") {
    element.style = "display: none"
  }
}

const createImageDiv = () => {
  let currentDiv = document.createElement("div");
  $(".js-images-container").append(currentDiv);
  return currentDiv;
}

const renderImageData = ({blob, canvas}) => {
    let div = createImageDiv();
    div.append(canvas);
    displayInfo("Original file", file, div);
    displayInfo("Compressed file", blob, div);
    displayDownloadLink("Download Minified Image", blob, div);
    clearInputs()
}

const clearInputs = () => {
  $('input[name="js-box-file"]').value = "";
}