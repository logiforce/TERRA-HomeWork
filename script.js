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
       3. Логика выбора тарифа (Связь карточек с формой)
       ========================================= */
    const pricingButtons = document.querySelectorAll('.pricing-btn');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const selectedPlan = this.getAttribute('data-plan');
            
            // Находим нужную радио-кнопку в форме и делаем её активной
            const radioToSelect = document.querySelector(`input[name="tariff_plan"][value="${selectedPlan}"]`);
            if (radioToSelect) {
                radioToSelect.checked = true;
            }

            // Ставим фокус на поле имени после плавного скролла
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
        e.preventDefault();

        // 1. Собираем данные (теперь берем тариф из выбранной радио-кнопки)
        const selectedPlanValue = document.querySelector('input[name="tariff_plan"]:checked').value;
        
        const formData = {
            plan: selectedPlanValue,
            name: document.getElementById('user_name').value,
            phone: document.getElementById('user_phone').value,
            email: document.getElementById('user_email').value,
            telegram: document.getElementById('user_telegram').value || 'Не указан',
            source: 'Лендинг Palantir'
        };

        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Отправка данных...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // ВАШ ВЕБХУК
        const webhookUrl = 'https://webhook.site/70f8abea-489d-48be-acbc-5bad21060ab7';

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                // Меняем заголовок на обычный текст, чтобы обойти блокировки CORS
                headers: {
                    'Content-Type': 'text/plain' 
                },
                body: JSON.stringify(formData) 
            });

            if (response.ok) {
                const formBox = document.querySelector('.action-box');
                formBox.innerHTML = `
                    <div class="success-message">
                        <h3>Заявка успешно принята</h3>
                        <p>Доступ к системе Palantir готовится.<br>Мы свяжемся с вами в ближайшее время по указанным контактам.</p>
                    </div>
                `;
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при соединении с сервером. Пожалуйста, попробуйте еще раз.');
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
    
});
