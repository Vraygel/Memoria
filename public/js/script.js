// sourceURL=script.js

document.addEventListener('DOMContentLoaded', function () {

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


	const telegramCheckbox = document.querySelector('.telegram-checkbox');
	
	const tooltip = document.getElementById('telegrammTooltip');

	if (telegramCheckbox) {
		telegramCheckbox.addEventListener('change', function () {
			console.log('lsadkf a;sdlfk as;dlfsd');
				if (telegramCheckbox.checked) {
						// Показываем всплывающую подсказку
						tooltip.style.display = 'block';
						// Вызываем функцию для автоматического закрытия сообщения
					closeTooltipAfterDelay();
				} else {
						// Скрываем всплывающую подсказку
						tooltip.style.display = 'none';
				}
		});
	}

	

	// Находим кнопку закрытия и всплывающее сообщение
const closeBtn = document.getElementById('closeTooltip');
// const tooltip = document.getElementById('telegrammTooltip');

if (closeBtn) {
	// Добавляем обработчик события для кнопки закрытия
	closeBtn.addEventListener('click', function () {
		tooltip.style.display = 'none'; // Скрываем всплывающее сообщение при клике на кнопку
	});
}



// Функция для автоматического закрытия сообщения через 15 секунд
function closeTooltipAfterDelay() {
	setTimeout(function () {
			tooltip.style.display = 'none'; // Скрываем всплывающее сообщение после 15 секунд
	}, 15000);
}


});








// document.addEventListener('DOMContentLoaded', function () {

// // Получаем кнопку "Добавить новый термин"
// const addButton = document.querySelector('.addNewTerm');

// // Функция для добавления нового блока newTerm
// function addNewTermBlock(event) {
//     event.preventDefault(); // Предотвращаем стандартное поведение кнопки submit

//     // Создаем новый элемент div с классом newTerm
//     const newTermDiv = document.createElement('div');
//     newTermDiv.classList.add('newTerm');
// 		newTermDiv.classList.add('balanceInfo');
		
//     // Добавляем HTML-разметку нового блока
//     newTermDiv.innerHTML = `
//         <p class="updateDictionary_label" for="word">Термин:</p>
//         <textarea id="word" name="word" required></textarea>
//         <p class="updateDictionary_label" for="translation">Определение:</p>
//         <textarea id="translation" name="translation" required></textarea>
// 				<button class="deleteNewTerm create-button">-</button>
//     `;

//     // Вставляем новый блок newTerm перед кнопкой "Сохранить"
//     const form = document.querySelector('.updateDictionary');
//     form.insertBefore(newTermDiv, addButton);

// 		deleteTermBlockFunc()
// }

// // Назначаем обработчик события на кнопку "Добавить новый термин"
// addButton.addEventListener('click', addNewTermBlock);

// })


document.addEventListener('DOMContentLoaded', function () {

	const word = document.querySelectorAll('.word');
	if (word) {
		for (const p of word) {
			p.addEventListener('click', function() {
				event.target.classList.toggle('word_max')
				event.target.classList.toggle('word_min')
			// this.style.height = 'auto'; /* Изменяем высоту на "авто" */
		 });
		}
		
	}
	

	let newDictonaries = document.querySelector('.newDictonaries ')
	let newDictonaries_button = document.querySelector('.newDictonaries_button')

	if (newDictonaries_button) {
		newDictonaries_button.addEventListener('click', (event) => {
			event.preventDefault()
			if (newDictonaries) {
				newDictonaries.classList.toggle('newDictonaries_none')
			}

		})
	}


	let gifImage = document.querySelectorAll('.wordImage');

	for (const gifImageItem of gifImage) {

		gifImageItem.addEventListener('mouseenter', (event) => {

			let src = event.target.src;

			// Заменяем путь к изображению на само изображение, чтобы запустить воспроизведение
			event.target.src = src;

		})
	}







	function deleteTermBlockFunc() {
		const deleteButtons = document.querySelectorAll('.deleteNewTerm');

		// Функция для удаления блока newTerm
		function deleteTermBlock(event) {
			event.preventDefault(); // Предотвращаем стандартное поведение кнопки

			// Получаем родительский элемент (блок newTerm)
			const termBlock = this.parentNode;

			// Удаляем блок newTerm из DOM
			termBlock.remove();
		}

		// Назначаем обработчик события для каждой кнопки "Удалить новый термин"
		deleteButtons.forEach(button => {
			button.addEventListener('click', deleteTermBlock);
		});
	}

	// Получаем ссылку на элементы
	const popup = document.getElementById('popup');
	const closeButton = document.getElementById('closeButton');

	if (popup) {
		// Функция для скрытия шаблона
		function hidePopup() {
			popup.style.display = 'none';
		}


		// Обработчик клика по кнопке "Закрыть"
		closeButton.addEventListener('click', hidePopup);

		// Обработчик клика в любом месте кроме шаблона
		document.addEventListener('click', function (event) {
			if (!popup.contains(event.target)) {
				hidePopup();
			}
		});
	}




	// Скрытие шаблона через 5 секунд
	setTimeout(hidePopup, 1000);


	const button = document.getElementById("myButtonShow");
	let div = document.querySelector(".myDiv");
	const styles = window.getComputedStyle(div);


	if (button) {
		// Добавляем обработчик события click для кнопки
		button.addEventListener("click", function () {
			const display = styles.display;

			// Если div скрыт, показываем его, иначе скрываем
			if (display === "none") {
				div.style.display = "block";
				button.textContent = "Скрыть ответ";
			} else {
				div.style.display = "none";
				button.textContent = "Показать ответ";
			}
		});
	}

})

document.addEventListener("DOMContentLoaded", function () {
	let imageAll = document.querySelectorAll('.wordImage');
	let audioAll = document.querySelectorAll('.wordAudio');
	let overlay = document.createElement("div")
	let container = document.querySelector('.container');
	let enlargedImg;
	let enlargedAudio;

	for (const audio of audioAll) {

    audio.addEventListener('click', () => {
				overlay.textContent = ''
        overlay.id = "overlayImg";
        container.appendChild(overlay);

				enlargedAudio = document.createElement("audio");
				enlargedAudio.id = "enlargedAudio";
				enlargedAudio.controls = ""
				enlargedAudio.setAttribute('controls', true);

let url = audio.getAttribute('src')
				enlargedAudio.src = url;
				overlay.appendChild(enlargedAudio);

				overlay.style.display = "block";
				enlargedAudio.style.display = "block";

    });
}

	function showEnlargedImg(event) {
			overlay.textContent = ''
			overlay.id = "overlayImg";
			container.appendChild(overlay);

			enlargedImg = document.createElement("img");
			enlargedImg.id = "enlargedImg";

			let url = event.target.getAttribute('url')
			enlargedImg.src = url; // нужен урл изображения из словаря
			overlay.appendChild(enlargedImg);

			overlay.style.display = "block";
			enlargedImg.style.display = "block";
	}

	function hideEnlargedImg() {
			overlay.textContent = ''
			overlay.style.display = "none";
			enlargedImg.style.display = "none";
	}

	for (const image of imageAll) {
			// image.removeEventListener("click", showEnlargedImg); // Удаляем предыдущий обработчик
			image.addEventListener("click", showEnlargedImg); // Добавляем новый обработчик
	}

	overlay.addEventListener("click", hideEnlargedImg);


});



