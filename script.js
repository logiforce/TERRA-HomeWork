// Ждем, пока вся структура страницы (HTML) полностью загрузится
document.addEventListener("DOMContentLoaded", function() {
    
    /* =========================================
       1. Логика навигационного меню и плавный скролл
       ========================================= */
    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", function() {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled"); 
        } else {
            navbar.classList.remove("scrolled"); 
        }
    });

    // Плавный скролл для всех ссылок-якорей
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* =========================================
       2. Логика плавной анимации (Scroll Reveal)
       ========================================= */
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, revealOptions);

    revealElements.forEach(element => { revealOnScroll.observe(element); });

    /* =========================================
       3. Логика выбора тарифа (Связь с формой)
       ========================================= */
    const pricingButtons = document.querySelectorAll('.pricing-btn');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const selectedPlan = this.getAttribute('data-plan');
            const radioToSelect = document.querySelector(`input[name="tariff_plan"][value="${selectedPlan}"]`);
            if (radioToSelect) {
                radioToSelect.checked = true;
            }

            setTimeout(() => {
                const nameInput = document.getElementById('user_name');
                if (nameInput) nameInput.focus();
            }, 800);
        });
    });

    /* =========================================
       4. Валидация формы
       ========================================= */
    const form = document.getElementById('palantir-form');
    const submitBtn = document.getElementById('submit-btn');
    const inputs = form.querySelectorAll('input[required]');
    const privacyCheckbox = document.getElementById('privacy');

    const patterns = {
        user_name: /^[A-Za-zА-Яа-яЁё\s]{2,50}$/,
        user_phone: /^[0-9\+\-\(\)\s]{10,20}$/,
        user_email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    };

    function validateInput(input) {
        if (patterns[input.name]) {
            const isValid = patterns[input.name].test(input.value);
            input.parentElement.classList.toggle('invalid', !isValid && input.value !== '');
            return isValid;
        }
        return true;
    }

    function checkFormValidity() {
        let isFormValid = true;
        inputs.forEach(input => { if (input.type !== 'checkbox' && !validateInput(input)) isFormValid = false; });
        if (!privacyCheckbox.checked) isFormValid = false;
        submitBtn.disabled = !isFormValid;
    }

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
            checkFormValidity();
        });
    });
    privacyCheckbox.addEventListener('change', checkFormValidity);

    /* =========================================
       5. Отправка данных (Webhook)
       ========================================= */
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

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

        // ВАШ ВЕБХУК
        const webhookUrl = 'https://webhook.site/70f8abea-489d-48be-acbc-5bad21060ab7';

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(formData) 
            });

            const formBox = document.querySelector('.action-box');
            formBox.innerHTML = `
                <div class="success-message">
                    <h3>Заявка успешно принята</h3>
                    <p>Доступ к системе Palantir готовится.<br>Мы свяжемся с вами в ближайшее время.</p>
                </div>
            `;
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка отправки: ' + error.message);
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
