document.querySelectorAll('.sports__tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Убираем активный класс у всех вкладок и контента
        document.querySelectorAll('.sports__tab').forEach(tab => tab.classList.remove('sports__tab--active'));
        document.querySelectorAll('.sports__content').forEach(content => content.classList.remove('sports__content--active'));

        // Добавляем активный класс к выбранной вкладке
        e.target.classList.add('sports__tab--active');

        // Добавляем активный класс к соответствующему контенту
        const sport = e.target.getAttribute('data-sport');
        document.querySelector(`.sports__content[data-container="${sport}"]`).classList.add('sports__content--active');
    });
});

// Функция для drag-скролла
function enableDragScroll(container) {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // multiplier for faster scroll
        container.scrollLeft = scrollLeft - walk;
    });

    // Добавляем курсор по умолчанию
    container.style.cursor = 'grab';
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const topicsContainer = document.getElementById('newsTopics');
    if (topicsContainer) {
        enableDragScroll(topicsContainer);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const teamsContainer = document.getElementById('teamsTopics');
    if (teamsContainer) {
        enableDragScroll(teamsContainer);
    }
});

document.addEventListener('DOMContentLoaded', () => {
   const teamsLogosContainer = document.getElementById('teamsLogos');
        if (teamsLogosContainer) {
            enableDragScroll(teamsLogosContainer);
        }
});

document.querySelectorAll('.slide__content').forEach(slide => {
    const dateElement = slide.querySelector('.slide__match-date');
    const timerElement = slide.querySelector('.slide__timer');
    
    const eventDate = new Date(dateElement.getAttribute('data-date').split('.').reverse().join('-')); // Преобразуем дату в правильный формат
    
    function updateTimer() {
        const now = new Date();
        const timeRemaining = eventDate - now;
        
        if (timeRemaining <= 0) {
            timerElement.innerHTML = 'Event Started'; 
            return;
        }

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        timerElement.querySelector('.days div').textContent = days < 10 ? '0' + days : days;
        timerElement.querySelector('.hours div').textContent = hours < 10 ? '0' + hours : hours;
        timerElement.querySelector('.minutes div').textContent = minutes < 10 ? '0' + minutes : minutes;
        timerElement.querySelector('.seconds div').textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    setInterval(updateTimer, 1000); // Обновляем таймер каждую секунду
});

    const swiper = new Swiper('.swiper-container', {
        loop: true,  
        centeredSlides: true, 
        slidesPerView: 'auto',  
        slidesToScroll: 1, 
        spaceBetween: 0,  
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true,
        },
    });


document.addEventListener('DOMContentLoaded', function() {
    const themeSwitchers = document.querySelectorAll('.header__themes-switcher');
    const body = document.body;

    // Функция для получения текущей темы из localStorage
    function getSavedTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    // Функция для сохранения темы в localStorage
    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    // Функция для смены фавикона
    function updateFavicon(theme) {
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            const faviconPath = theme === 'dark' 
                ? 'images/favicon-dark.png' 
                : 'images/favicon-light.png';
            favicon.href = faviconPath;
        }
    }

    // Функция для применения темы
    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        
        // Обновляем фавикон
        updateFavicon(theme);
        
        // Обновляем видимость иконок во всех переключателях
        themeSwitchers.forEach(switcher => {
            const darkIcon = switcher.querySelector('.header__theme-icon--dark');
            const lightIcon = switcher.querySelector('.header__theme-icon--light');
            
            if (theme === 'dark') {
                if (darkIcon) darkIcon.classList.add('header__theme-icon--active');
                if (lightIcon) lightIcon.classList.remove('header__theme-icon--active');
            } else {
                if (lightIcon) lightIcon.classList.add('header__theme-icon--active');
                if (darkIcon) darkIcon.classList.remove('header__theme-icon--active');
            }
        });
    }

    // Функция для переключения темы
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme') || getSavedTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        saveTheme(newTheme);
    }

    // Инициализация темы при загрузке страницы
    function initTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);
    }

    // Добавляем обработчики клика на все переключатели
    themeSwitchers.forEach(switcher => {
        switcher.addEventListener('click', toggleTheme);
    });

    // Инициализируем тему
    initTheme();
});


document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  
  // Обработчик клика на сайдбар (делегирование событий)
  sidebar.addEventListener('click', function(e) {
    const link = e.target.closest('.sidebar__nav-item a[href^="#"]');
    
    if (!link) return;
    
    e.preventDefault();
    
    // Убираем класс у всех элементов
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.classList.remove('sidebar__nav-item--current');
      sidebar.classList.remove('open');
    });
    
    // Добавляем класс текущему элементу
    link.closest('.sidebar__nav-item').classList.add('sidebar__nav-item--current');
    
    // Плавный скролл
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
    // Находим элементы
    const popup = document.querySelector('.app-popup');
    const downloadBtn = document.querySelector('.app-popup__btn--2');
    const qrContent = document.querySelector('.app-popup__content--qr');
    const androidContent = document.querySelector('.app-popup__content--android');
    const iosContent = document.querySelector('.app-popup__content--ios');
    
    // Функция для определения операционной системы
    function getOS() {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const platform = window.navigator.platform.toLowerCase();
        
        if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
        if (/mac/.test(platform) && navigator.maxTouchPoints > 1) return 'ios';
        if (/mac/.test(platform)) return 'mac';
        if (/android/.test(userAgent)) return 'android';
        if (/win/.test(platform)) return 'windows';
        
        return 'android';
    }

    // Функция показа попапа
    function showPopup() {
        popup.classList.add('open');
        document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
        
        // Сбрасываем к исходному состоянию (показываем QR блок)
        qrContent.style.display = 'flex';
        androidContent.style.display = 'none';
        iosContent.style.display = 'none';
    }

    // Функция скрытия попапа
    function hidePopup() {
        popup.classList.remove('open');
        document.body.style.overflow = ''; // Восстанавливаем скролл
    }

    // Обработчик для ссылок с классом app-link
    document.querySelectorAll('.app-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPopup();
        });
    });

    // Обработчик для кнопки "Download Now"
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const os = getOS();
        
        // Скрываем QR блок и показываем соответствующий блок загрузки
        qrContent.style.display = 'none';
        if (os === 'ios' || os === 'mac') {
            iosContent.style.display = 'flex';
        } else {
            androidContent.style.display = 'flex';
        }
    });

    // Закрытие попапа при клике вне контента
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            hidePopup();
        }
    });

    // Закрытие при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList === 'open') {
            hidePopup();
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const sidebrLink = document.querySelector('.open-nav');

  sidebrLink.addEventListener('click', function(e) {
    sidebar.classList.toggle('open');
  });

});