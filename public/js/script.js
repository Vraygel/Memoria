// sourceURL=script.js

document.addEventListener('DOMContentLoaded', function () {




// перенести в приложение

let glossary = document.querySelectorAll('.glossary');

if (glossary) {
	for (const text of glossary) {
		text.addEventListener('click', () => {
			for (const children of text.children) {
				console.log(children);
				
				children.classList.toggle('glossary__text_visible')
			}
	
	
		})
	}
}

// автоширина в textarea
const sectionDesc = document.querySelectorAll('.section__desc');

if (sectionDesc) {
	for (const textarea of sectionDesc) {
		textarea.addEventListener('input', function () {
			autoResizeTextarea(textarea);
		});
	}
}

function autoResizeTextarea(textarea) {
	textarea.style.height = 'auto'; // Сначала сбрасываем высоту
	textarea.style.height = textarea.scrollHeight + 'px'; // Устанавливаем высоту в зависимости от содержания

}



// Получаем кнопку "Добавить новый термин"
const addFormButton = document.querySelector('.section__btn-add_form');

if (addFormButton) {
	// Функция для добавления нового блока newTerm
	function addNewTermBlock(event) {
		event.preventDefault(); // Предотвращаем стандартное поведение кнопки submit

		// Создаем новый элемент div с классом newTerm
		const newTermDiv = document.createElement('div');
		newTermDiv.classList.add('section__form--wrapper');
		let id = addFormButton.getAttribute('dictionary')

		// Добавляем HTML-разметку нового блока
		newTermDiv.innerHTML = `
				<div class="section__form--inner">

					<label class="section__form--label-file" for="fileInputImg_${id}">Добавить изображение</label>
					<label class="section__form--label-file" for="fileInputAudio_${id}">Добавить аудио</label>
					
					<input class="section__form--input-file fileInput" type="file" name="file" id="fileInputImg"
							accept=".jpg, .jpeg, .png, .gif, .bmp" maxlength="5242880">
					<input class="section__form--input-file fileInput" type="file" name="file" id="fileInputAudio"
						accept=".mp3, .wav, .ogg, .aac, .flac" maxlength="5242880">
				</div>

				<label class="section__label" for="new_term">Термин:</label>
				<textarea class="section__desc" id="new_term" name="word" required=""></textarea>

				<label class="section__label" for="new_definition">Определение:</label>
				<textarea class="section__desc" id="translation" name="translation" required=""></textarea>
				<button class="section__btn section__btn_wide section__btn-del_form deleteNewTerm create-button">-</button>
    `;

		// Вставляем новый блок newTerm перед кнопкой "Сохранить"
		const form = document.querySelector('.updateDictionary');
		form.insertBefore(newTermDiv, addFormButton);

		deleteTermBlockFunc()
	}

	// Назначаем обработчик события на кнопку "Добавить новый термин"
	addFormButton.addEventListener('click', addNewTermBlock);

	function deleteTermBlockFunc() {
		const deleteFormButtons = document.querySelectorAll('.section__btn-del_form');

		// Функция для удаления блока newTerm
		function deleteTermBlock(event) {
			event.preventDefault(); // Предотвращаем стандартное поведение кнопки

			// Получаем родительский элемент (блок newTerm)
			const termBlock = this.parentNode;

			// Удаляем блок newTerm из DOM
			termBlock.remove();
		}

		// Назначаем обработчик события для каждой кнопки "Удалить новый термин"
		deleteFormButtons.forEach(button => {
			button.addEventListener('click', deleteTermBlock);
		});
	}

}




let headerItemLogin = document.querySelector('.header__item-login')
let headerItemSignup = document.querySelector('.header__item-signup')

if (headerItemLogin) {
	headerItemLogin.addEventListener('click', () => {
		let login = document.querySelector('.login')
		// login.classList.toggle('form-rotate') 
		let formRegister = document.querySelector('.container')
		formRegister.classList.toggle('form-rotate')
		let headerItemInner = document.querySelector('.header__item-inner')
		headerItemInner.classList.toggle('header__item-inner-rotate')
	})

	let togglePassword = document.querySelectorAll('.toggle-password')

	for (const button of togglePassword) {
		button.addEventListener('click', (event) => {
			togglePasswordFunc(event.target)
		})
	}

	// togglePassword

	function togglePasswordFunc(button) {
		const passwordInput = button.previousElementSibling
		const toggleButton = document.querySelector('.toggle-password');

		if (passwordInput.type === 'password') {
			passwordInput.type = 'text';
			toggleButton.textContent = 'Скрыть';
		} else {
			passwordInput.type = 'password';
			toggleButton.textContent = 'Показать';
		}
	}
}






// Функция для проверки ввода Email
let sectionsFormInputEmail = document.querySelector('.sections__form-input-email')

if (sectionsFormInputEmail) {
	sectionsFormInputEmail.addEventListener('input', (event) => {
		validateEmail(event.target)
	})
}





function validateEmail(input) {
	const phoneNumberInput = input.value;
	const phoneErrorMessage = document.getElementById('emailErrorMessage');

	if (!phoneNumberInput.match(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)) {
		phoneErrorMessage.style.display = 'inline-block';
	} else {
		phoneErrorMessage.style.display = 'none';
	}
}



// Функция для проверки пароля


let errorMessagePassword = document.querySelector('.sections__form-error-message-password')
// errorMessagePassword.style.display = 'none';

let inputPasswordConfirm = document.querySelector('.sections__form-password-first')
let inputPassword = document.querySelector('.sections__form-password-second')

let password = document.querySelectorAll('.sections__form-password')

for (const input of password) {
	input.addEventListener('input', (event) => {
		console.log(inputPasswordConfirm.value);
		console.log(inputPassword.value);
		if (inputPasswordConfirm.value == inputPassword.value) {
			errorMessagePassword.style.display = 'none';
		} else {
			errorMessagePassword.style.display = 'inline-block';
		}
	})
}


let sectionsFormCheckboxTelegramm = document.querySelector('.sections__form-checkbox-telegramm')

if (sectionsFormCheckboxTelegramm) {
	sectionsFormCheckboxTelegramm.addEventListener("change", function () {
		if (sectionsFormCheckboxTelegramm.checked) {
			// Ваш код или действие, если чекбокс отмечен
			let telegrammTooltip = document.querySelector('.telegrammTooltip')
			telegrammTooltip.style.display = 'block'
			setTimeout(() => {
				telegrammTooltip.style.display = 'none'
			}, 10000);
		} else {
			telegrammTooltip.style.display = 'none'
		}
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


let sectionsNavLinkDelete = document.querySelectorAll('.sections__nav-link-delete')
for (const link of sectionsNavLinkDelete) {
	link.addEventListener('click', (event) => {
		let dictionary = event.target.getAttribute('dictionary')
		confirmDelete(dictionary)
	})

}

function confirmDelete(dictionaryId) {
	if (confirm("Вы уверены, что хотите удалить этот словарь?")) {
		window.location.href = "/dictionaries/deleteGlossary/" + dictionaryId;
	}
}


})