// Grossly copied from https://github.com/aligoren/ts-url-shortener

const btnShort = document.getElementById('btn-short');
const url = document.getElementById('url');
const urlAlert = document.getElementById('url-alert');
const urlAlertText = document.getElementById('url-alert-text');

btnShort.addEventListener('click', async () => {
  const fullUrl = url.value;
  let valid = false;
  let message;
  if (isUrlValid(fullUrl)) {
    try {
      const response = await fetch('/api/v1/slugs', {
        method: 'POST',
        body: JSON.stringify({ url: fullUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(resp => resp.json());
      valid = true;
      message = `${window.location.origin}/${response.slug}`;
    } catch (err) {
      console.error('Error', err);
      message = "URL couldn't shortened";
    }
  } else {
    message = 'Please enter a correct URL';
  }

  shortenerResponse(valid, message);
});

url.addEventListener('keypress', e => {
  if (e.which === 13 || e.keyCode === 13 || e.key === 'Enter') {
    btnShort.click();
  }
});

function isUrlValid(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');
  return !!pattern.test(str);
}

function shortenerResponse(valid, msg) {
  let message;
  if (valid) {
    urlAlert.classList.remove('alert-danger');
    urlAlert.classList.add('alert-success');
    urlAlert.classList.remove('invisible');
    message = `
            <strong>Your URL:</strong> 
            <a id="shorted-url" href="${msg}" target="_blank">${msg}</a>
            <button class="btn btn-sm btn-primary float-right float-sm-right" id="btn-copy-link">Copy</button>
            <span class="mr-2 right d-none" id="copied">Copied</span>  
        `;
  } else {
    urlAlert.classList.remove('alert-success');
    urlAlert.classList.add('alert-danger');
    urlAlert.classList.remove('invisible');
    message = `<strong>Warning:</strong> ${msg}`;
  }

  urlAlertText.innerHTML = message;
}

// Copy slug to clipboard

document.addEventListener('click', e => {
  if (e.target && e.target.id === 'btn-copy-link') {
    const slugUrl = document.getElementById('shorted-url');
    const copied = saveClipboard(slugUrl.href);
    if (copied) {
      document.getElementById('copied').classList.remove('d-none');
    }
  }
});

function saveClipboard(data) {
  const dummy = document.createElement('input');
  const text = data;
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  const success = document.execCommand('copy');
  document.body.removeChild(dummy);
  return success;
}
