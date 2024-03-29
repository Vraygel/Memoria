function countdown(targetDate) {
	// Функция для форматирования времени
	function formatTime(milliseconds) {
			const seconds = Math.floor((milliseconds / 1000) % 60);
			const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
			const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
			const days = Math.floor((milliseconds / (1000 * 60 * 60 * 24)) % 30);
			const months = Math.floor((milliseconds / (1000 * 60 * 60 * 24 * 30)));

			return `${months} мес., ${days} дн., ${hours} ч., ${minutes} мин., ${seconds} сек.`;
	}

	// Функция для обновления времени на странице
	function updateCountdown() {
			const currentTime = new Date();
			const difference = targetDate - currentTime;
			if (difference <= 0) {
					clearInterval(timer);
					console.log("Событие уже произошло");
					return;
			}
			console.log("Осталось времени:", formatTime(difference));
	}

	// Обновляем счетчик каждую секунду
	const timer = setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', function () {
	const telegramCheckbox = document.querySelector('.telegram-checkbox');
	
	const tooltip = document.getElementById('telegrammTooltip');
	console.log(telegramCheckbox);
	telegramCheckbox.addEventListener('change', function () {
		console.log('lsadkf a;sdlfk as;dlfsd');
			if (telegramCheckbox.checked) {
					// Показываем всплывающую подсказку
					tooltip.style.display = 'block';
			} else {
					// Скрываем всплывающую подсказку
					tooltip.style.display = 'none';
			}
	});

	// Находим кнопку закрытия и всплывающее сообщение
const closeBtn = document.getElementById('closeTooltip');
// const tooltip = document.getElementById('telegrammTooltip');

// Добавляем обработчик события для кнопки закрытия
closeBtn.addEventListener('click', function () {
	tooltip.style.display = 'none'; // Скрываем всплывающее сообщение при клике на кнопку
});

// Функция для автоматического закрытия сообщения через 15 секунд
function closeTooltipAfterDelay() {
	setTimeout(function () {
			tooltip.style.display = 'none'; // Скрываем всплывающее сообщение после 15 секунд
	}, 15000);
}

// Вызываем функцию для автоматического закрытия сообщения
closeTooltipAfterDelay();



});


 // Получаем ссылку на элементы
 const popup = document.getElementById('popup');
 const closeButton = document.getElementById('closeButton');

 // Функция для скрытия шаблона
 function hidePopup() {
		 popup.style.display = 'none';
 }

 // Обработчик клика по кнопке "Закрыть"
 closeButton.addEventListener('click', hidePopup);

 // Обработчик клика в любом месте кроме шаблона
 document.addEventListener('click', function(event) {
		 if (!popup.contains(event.target)) {
				 hidePopup();
		 }
 });

 // Скрытие шаблона через 5 секунд
 setTimeout(hidePopup, 5000);


 const button = document.getElementById("myButtonShow");
  const div = document.getElementById("myDiv");

console.log(button);
console.log(div);


  // Добавляем обработчик события click для кнопки
  button.addEventListener("click", function() {
		console.log('sdf sazdf sfddsf');
    // Если div скрыт, показываем его, иначе скрываем
    if (div.style.display === "none") {
      div.style.display = "block";
      button.textContent = "Скрыть Div";
    } else {
      div.style.display = "none";
      button.textContent = "Показать Div";
    }
  });