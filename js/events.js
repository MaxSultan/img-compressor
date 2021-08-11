/* Settings Events */
const listen = (sel, event) => {
    document.body.addEventListener(event, (ev) => {
      if (!ev.target.matches(sel)) {
        return true;
      }
      if (sel === 'button[name="js-settings-button"]' && event === 'click') {
        toggleElement(settingsForm)
        if (settingsButton.innerText === "Show Settings") {
          settingsButton.innerText = "Hide Settings"
        } else if (settingsButton.innerText === "Hide Settings") {
          settingsButton.innerText = "Show Settings"
        }
      }
      if (sel === 'select[name="image-quality"]' && event === 'change') {
        ev.preventDefault();
        quality = parseFloat(ev.target.value, 10);
      }
      if (sel === 'select[name="smoothing-options"]' && event === 'change') {
        ev.preventDefault();
        smoothingOptions = ev.target.value;
      }
      if (sel === 'input[name="js-aspect-ratio"]' && event === 'change') {
        if ($('input[name="js-aspect-ratio"]').checked) aspectRatioPreserved = true;
        else aspectRatioPreserved = false;
      }
      if (sel === 'input[name="js-height"]' && event === 'change') {
        inputHeight = parseFloat(ev.target.value, 10);
      }
      if (sel === 'input[name="js-width"]' && event === 'change') {
        inputWidth = parseFloat(ev.target.value, 10);
      }
      if (sel === 'input[name="js-box-file"]' && event === 'change') {
        file = ev.target.files[0]; // get the file
        renderMinifiedFile(file);
      }
  
      // There is a bug where the drag and drop box turns white when the item crosses the label and expected drop to upload does not happen
      // My assumption is that there is no drag and drop events on labels 
      // we need to let the event bubble up/propigate to the div/form
  
      if (['form[name="js-box"]', 'div[name="js-box-input"]', 'input[name="js-box-file"]'].includes(sel)) {
        // debugger;
        if (['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].includes(event)) {
          ev.preventDefault();
          // ev.stopPropagation();
        }
        if (['dragover', 'dragenter'].includes(event)) {
          dragAndDropForm.classList.add('is-dragover');
        }
        if (['dragleave', 'dragend', 'drop'].includes(event)) {
          dragAndDropForm.classList.remove('is-dragover');
        }
        if (event === 'drop') {
          file = ev.dataTransfer.files[0];
          renderMinifiedFile(file);
        }
      }
    });
  }
  listen('button[name="js-settings-button"]', 'click');
  listen('select[name="image-quality"]', 'change');
  listen('select[name="smoothing-options"]', 'change');
  listen('input[name="js-aspect-ratio"]', 'change');
  listen('input[name="js-height"]', 'change');
  listen('input[name="js-width"]', 'change');
  /* End of Settings Events */
  
  listen('input[name="js-box-file"]', 'change');
  [
    'form[name="js-box"]',
    'div[name="js-box-input"]',
    'input[name="js-box-file"]',
  ].forEach(formItem => {
    ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(event => {
      listen(formItem, event);
    })
  })

  window.addEventListener("paste", (e) => {
    var item = Array.from(e.clipboardData.items).find(x => /^image\//.test(x.type));
    try {
      file = item.getAsFile();
    } catch {
      alert('This is not an image element')
      return;
    }
  
    renderMinifiedFile(file);
  });