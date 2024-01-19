const previewElements = document.querySelectorAll('simulation-preview');
for (const element of previewElements) element.setAttribute('href', './simulation.html');

document.addEventListener('readystatechange', function () {
  if (document.readyState === 'complete') {
    document.querySelector('body').style.visibility = 'visible';
    document.querySelector('#loader').style.display = 'none';
  } else {
    document.querySelector('body').style.visibility = 'hidden';
    document.querySelector('#loader').style.visibility = 'visible';
  }
});
