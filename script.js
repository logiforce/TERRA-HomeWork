// Ждем, пока вся структура страницы (HTML) полностью загрузится
document.addEventListener("DOMContentLoaded", function() {
    
    /* =========================================
       1. Логика навигационного меню (Sticky Header)
       ========================================= */
    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", function() {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled"); 
        } else {
            navbar.classList.remove("scrolled"); 
        }
    });

    /* =========================================
       2. Логика плавной анимации (Scroll Reveal)
       ========================================= */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return; 
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, revealOptions);

    revealElements.forEach(element => {
        revealOnScroll.observe(element);
    });

    /* =========================================
       3. Логика выбора тарифа (Подготовка к блоку Action)
       ========================================= */
    // Находим все кнопки в тарифах
    const pricingButtons = document.querySelectorAll('.pricing-btn');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Узнаем, какой тариф выбрали (берем из data-plan)
            const selectedPlan = this.getAttribute('data-plan');
            
            // Названия тарифов для красивого вывода в форме
            const planNames = {
                'standard': 'Стандарт',
                'pro': 'ПРО',
                'expert': 'Эксперт'
            };

            // Пытаемся найти элементы формы (мы их создадим в следующем шаге)
            const formTitle = document.getElementById('form-dynamic-title');
            const hiddenPlanInput = document.getElementById('hidden-plan-input');

            // Если форма уже есть на странице - обновляем ее данные
            if (formTitle && hiddenPlanInput) {
                formTitle.innerHTML = `Оформление подписки: <span>Тариф ${planNames[selectedPlan]}</span>`;
                hiddenPlanInput.value = selectedPlan;
            }
        });
    });

    /* =========================================
       4. Валидация формы (Action Block)
       ========================================= */
    const form = document.getElementById('palantir-form');
    const submitBtn = document.getElementById('submit-btn');
    const inputs = form.querySelectorAll('input[required]');
    const privacyCheckbox = document.getElementById('privacy');

    // Регулярные выражения для проверок
    const patterns = {
        user_name: /^[A-Za-zА-Яа-яЁё\s]{2,50}$/,
        user_phone: /^[0-9\+\-\(\)\s]{10,20}$/, // Упрощенная проверка для цифр и знаков
        user_email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    };

    function validateInput(input) {
        if (patterns[input.name]) {
            const isValid = patterns[input.name].test(input.value);
            const formGroup = input.parentElement;
            
            if (isValid) {
                formGroup.classList.remove('invalid');
                return true;
            } else {
                if(input.value !== '') formGroup.classList.add('invalid');
                return false;
            }
        }
        return true;
    }

    function checkFormValidity() {
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (input.type !== 'checkbox' && !validateInput(input)) {
                isFormValid = false;
            }
        });

        if (!privacyCheckbox.checked) {
            isFormValid = false;
        }

        // Включаем или выключаем кнопку
        submitBtn.disabled = !isFormValid;
    }

    // Слушаем изменения в полях в реальном времени
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
            checkFormValidity();
        });
    });

    privacyCheckbox.addEventListener('change', checkFormValidity);

    // Запрет отправки формы по умолчанию (пока нет бэкенда)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Данные успешно подготовлены для разработчиков! Выбранный тариф: ' + document.getElementById('hidden-plan-input').value);
    });
    
});
