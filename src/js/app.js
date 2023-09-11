import * as firstFunctions from "./modules/functions.js";

firstFunctions.isWebp();

const requestURL = 'https://private-anon-6e6cde58ad-grchhtml.apiary-mock.com/slides';
let offset = 0;
let limit = 3;
let slidesCount = 0;
const xhr = new XMLHttpRequest();

// init
var mainSwiper = new Swiper(".main__swiper", {
    slidesPerView: 1,
    allowTouchMove: false,
    lazyLoading: true,
    navigation: {
        nextEl: ".swiper__arrow-next",
        prevEl: ".swiper__arrow-prev",
    },
});

loadSlides(offset, limit);

mainSwiper.on('reachEnd', function () {
    if (mainSwiper.realIndex + 2 < slidesCount) {
        offset += 3;
        loadSlides(offset, limit);
    }
});

function loadSlides(offset, limit) {
    xhr.open('GET', requestURL + '?limit=' + limit + '&offset=' + offset);
    xhr.onload = () => {
        const response = JSON.parse(xhr.response);
        const slides = response['data'];
        slidesCount = response['countAll'];

        slides.forEach(function (item, i, slides) {
            let slide = slides[i],
                id = slide['id'],
                title = slide['title'],
                desc = slide['desc'],
                imgUrl = slide['imgUrl'] || 'img/error.png',
                likeCnt = +slide['likeCnt'],
                buttonClass = '';

            if (checkLike(id)) {
                likeCnt++;
                buttonClass = 'active';
            }

            //добавление нового слайда
            mainSwiper.appendSlide(`
            <div class="swiper-slide slide" data-slide-id="${id}" style="background-image: url('${imgUrl}')">
                 <div class="slide__header">
                     <h2 class="slide__title" data-tooltip="${title}">
                            <span class="slide__title-content">${title}</span>
                     </h2>
                     <p class="slide__description" data-tooltip="${desc}">
                            <span class="slide__description-content">${desc}</span>
                     </p>
                 </div>
                 <div class="slide__like like">
                     <a href="javascript:void(0)" class="like__btn like__show-popup ${buttonClass}" id="showPopup${id}">
                         <svg width="39" height="37" viewBox="0 0 39 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M0 18.2426H7.21056V35.548H0V18.2426ZM35.4541 13.556H25.2367L25.3594 9.5182L26.4408 4.3266L24.8761 0H21.3936L20.6723 6.36706L17.067 11.8977L15.7477 18.9855H12.0197V35.548L20.795 36.0529H31.0702L34.8555 33.349L38.1001 19.721L35.4541 13.556Z"/>
                         </svg>
                     </a>
                     <div class="like__num">
                         like: <span class="orange">${likeCnt}</span>
                     </div>
                 </div>
             </div>
            `)

            //клик на лайк
            var btnsShowPopup = document.querySelectorAll('.like__show-popup');
            btnsShowPopup.forEach(btn => {
                btn.addEventListener('click', function (event) {
                    let idSlide = event.target.closest('.slide').dataset.slideId;
                    sendLike(idSlide);
                });
            });

        });
    }
    xhr.onerror = () => {
        console.log('Error')
    }
    xhr.send();
}

function sendLike(idSlide) {
    let currentBtn = document.querySelector('#showPopup' + idSlide);
    if (currentBtn.classList.contains('active')) {

    } else {
        xhr.open('POST', requestURL + '/' + idSlide + '/like');
        xhr.onload = () => {
            let likeResponse = JSON.parse(xhr.response),
                likePopupTitle = likeResponse.title,
                likePopupSubtitle = likeResponse.desc,
                likePopupText = `Ваше мнение очень ценно для нас!<br> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`;

            let likesEl = document.querySelector(".slide[data-slide-id='" + idSlide + "']").querySelector('.orange');
            let nowLike = likesEl.textContent;
            likesEl.textContent = +nowLike + 1;
            saveLike(+idSlide, +nowLike + 1);

            // показываем попап
            showPopup(likePopupTitle, likePopupSubtitle, likePopupText);

            // добавляем класс актив кнопке
            currentBtn.classList.add('active');
        }
        xhr.onerror = () => {
            //    показываем попап с ошибкой
            showPopup();
        }
        xhr.send();
    }
}


let body = document.querySelector('body'),
    popup = document.querySelector('#popup'),
    popupBack = document.querySelector('.popup__background'),
    btnClosePopup = document.querySelector('#closePopup');

btnClosePopup.addEventListener('click', closePopup);
popupBack.addEventListener('click', closePopup);

function showPopup(title = 'Что-то пошло не так :/', subtitle = 'Пожалуйста, попробуйте позже', text = '') {
    document.querySelector('#popup .popup__title').innerHTML = title;
    document.querySelector('#popup .popup__subtitle').innerHTML = subtitle;
    if (text === '') {
        document.querySelector('#popup .popup__desc').style.display = 'none';
    } else {
        document.querySelector('#popup .popup__desc').innerHTML = text;
    }

    body.classList.add('noScroll');
    popup.classList.add('active');
}

function closePopup() {
    body.classList.remove('noScroll');
    popup.classList.remove('active');
}

function saveLike(idSlide, newCount) {
    let now = JSON.parse(localStorage.getItem('likes'));
    if (now === null) {
        now = {};
    }
    now[idSlide] = newCount;
    localStorage.setItem('likes', JSON.stringify(now));
}

function checkLike(idSlide) {
    let likes = JSON.parse(localStorage.getItem('likes'));
    if (likes === null) {
        likes = {};
    }
    return likes[idSlide] !== undefined;
}