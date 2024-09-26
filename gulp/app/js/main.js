let burger = document.querySelector('.menu__burger');
let menu = document.querySelector('.header__menu');
let menuLinks = document.querySelectorAll('.header__item-link');

burger.addEventListener('click', function () {
	menu.classList.toggle('header__nav--active');
	document.body.classList.toggle('stop-scroll');
});



menuLinks.forEach(function (el) {
	el.addEventListener('click', function () {
		menu.classList.remove('header__nav--active');
		document.body.classList.remove('stop-scroll')
	})
});

document.querySelector(".close").addEventListener("click", function () {
	document.querySelector(".header__menu").classList.remove("header__nav--active");
});


var swiper = new Swiper(".reviews__slider", {
	slidesPerView: 1,
	spaceBetween: 24,
	keyboard: true,
	autoHeight: true,
	pagination: {
		el: ".swiper-pagination",
		clickable: true,
	},
	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	},
	breakpoints: {
		640: {
			slidesPerView: 2,
			spaceBetween: 20,
		},
		768: {
			slidesPerView: 2.2,
			spaceBetween: 24,
		},
		1024: {
			slidesPerView: 3.4,
			spaceBetween: 32,
		},
	},
});

new Accordion('.accordion');

var selector = document.querySelector("input[type='tel']");
var im = new Inputmask("+7(999)999-99-99");
im.mask(selector);

const validation = new JustValidate('.form', {
	errorLabelStyle: {
		color: '#F13636',
	}
});

validation.onSuccess(function () {
	document.getElementById("form").submit();
});

validation
	.addField('#name', [
		{
			rule: 'required',
			errorMessage: 'Как вас зовут?',
		},
		{
			rule: 'minLength',
			value: 3,
			errorMessage: 'Не короче 3 символов',
		},
		{
			rule: 'maxLength',
			value: 30,
			errorMessage: 'Слишком длинное имя',
		},
	])
	.addField('#tel', [
		{
			rule: 'required',
			errorMessage: 'Укажите ваш телефон',
		},
		{
			validator: (value) => {
				const phone = selector.inputmask.unmaskedvalue()
				console.log(phone)
				return Number(phone) && phone.length === 10;
			},
			errorMessage: 'Телефон не корректный!',
		},
	]);


document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('form');
	const formInner = document.getElementById('formInner');
	form.addEventListener('submit', formSend);

	async function formSend(e) {
		e.preventDefault();

		let error = formValidate(form);
		let formData = new FormData(form);

		if (error === 0) {
			formInner.classList.add('_sending')
			let response = await fetch('sendUser.php', {
				method: 'POST',
				body: formData
			});
			if (response.ok) {
				let result = await response.json();
				alert(result.message);
				form.reset();
				formInner.classList.remove('_sending');
			} else {
				alert("Ошибка");
				formInner.classList.remove('_sending');
			}
		} else {
			alert('Заполните обязательные поля');
		}
	}

	function formValidate(form) {
		let error = 0;
		let formReq = document.querySelectorAll('._req');


		for (let index = 0; index < formReq.length; index++) {
			const input = formReq[index];
			if (input.getAttribute("type") === "checkbox" && input.checked === false) {
				error++
			} else {
				if (input.value === '') {
					error++
				}
			}

		}

		return error;

	}




});