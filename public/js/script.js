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

