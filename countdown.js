function startCountdown() {
  let days = 2238;
  let hours = 53722.5;
  let minutes = 3223350;
  let seconds = 193401000;

  setInterval(() => {
      days -= 0.000694444;
      hours -= 0.0166667;
      minutes -= 1;
      seconds -= 60;

      document.getElementById('days').textContent = `${Math.floor(days)} Days`;
      document.getElementById('hours').textContent = `${hours.toFixed(2)} Hours`;
      document.getElementById('minutes').textContent = `${Math.floor(minutes)} Minutes`;
      document.getElementById('seconds').textContent = `${Math.floor(seconds)} Seconds`;
  }, 60000);
}

function slideUpElements() {
  const elements = [
      document.getElementById('days'),
      document.getElementById('hours'),
      document.getElementById('minutes'),
      document.getElementById('seconds')
  ];

  let currentIndex = 0;

  function showNextElement() {
      elements[currentIndex].classList.remove('visible');
      elements[currentIndex].classList.add('hidden');

      setTimeout(() => {
          currentIndex = (currentIndex + 1) % elements.length;
          elements[currentIndex].classList.remove('hidden');
          elements[currentIndex].classList.add('visible');
      }, 1500);
  }

  elements[currentIndex].classList.add('visible');

  setInterval(showNextElement, 3000);
}

window.onload = () => {
  startCountdown();
  slideUpElements();
};
