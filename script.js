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
    const pricingButtons = document.querySelectorAll('.pricing-btn');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const selectedPlan = this.getAttribute('data-plan');
            
            const planNames = {
                'standard': 'Стандарт',
                'pro': 'ПРО',
                'expert': 'Эксперт'
            };

            const formTitle = document.getElementById('form-dynamic-title');
            const hiddenPlanInput = document.getElementById('hidden-plan-input');

            if (formTitle && hiddenPlanInput) {
                formTitle.innerHTML = `Оформление подписки: <span>Тариф ${planNames[selectedPlan]}</span>`;
                hiddenPlanInput.value = selectedPlan;
            }

            // МАГИЯ UX: Ждем 800 миллисекунд (пока идет плавный скролл) 
            // и автоматически ставим курсор в поле "Ваше имя"
            setTimeout(() => {
                const nameInput = document.getElementById('user_name');
                if (nameInput) {
                    nameInput.focus();
                }
            }, 800);
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

    /* =========================================
       5. Отправка данных через Webhook (Fetch API)
       ========================================= */
    form.addEventListener('submit', async function(e) {
        // Останавливаем стандартную перезагрузку страницы
        e.preventDefault();

        // 1. Собираем данные из полей формы в единый объект
        const formData = {
            plan: document.getElementById('hidden-plan-input').value,
            name: document.getElementById('user_name').value,
            phone: document.getElementById('user_phone').value,
            email: document.getElementById('user_email').value,
            telegram: document.getElementById('user_telegram').value || 'Не указан',
            source: 'Лендинг Palantir'
        };

        // 2. Меняем состояние кнопки (UX: показываем процесс загрузки)
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Отправка данных...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // 3. ВСТАВЬТЕ СЮДА ВАШ URL ВЕБХУКА (между кавычками)
        const webhookUrl = 'https://webhook.site/70f8abea-489d-48be-acbc-5bad21060ab7';

        try {
            // 4. Отправляем POST-запрос на вебхук
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData) // Превращаем данные в JSON
            });

            // 5. Проверяем статус ответа
            if (response.ok) {
                // Если успешно: заменяем форму на красивое сообщение
                const formBox = document.querySelector('.action-box');
                formBox.innerHTML = `
                    <div class="success-message">
                        <h3>Заявка успешно принята</h3>
                        <p>Доступ к системе Palantir готовится.<br>Мы свяжемся с вами в ближайшее время по указанным контактам.</p>
                    </div>
                `;
            } else {
                // Если сервер ответил ошибкой (например, 400 или 500)
                throw new Error('Ошибка сервера при отправке');
            }
            
        } catch (error) {
            // Если пропал интернет или вебхук недоступен
            console.error('Ошибка:', error);
            alert('Произошла ошибка при соединении с сервером. Пожалуйста, попробуйте еще раз.');
            
            // Возвращаем кнопку в исходное состояние
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
    
});
