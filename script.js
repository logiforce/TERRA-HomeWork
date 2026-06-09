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
       5. Отправка данных через Webhook
       ========================================= */
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 1. Собираем данные
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

        // ВАШ ВЕБХУК (Убедитесь, что тут HTTPS!)
        const webhookUrl = 'https://logiforge.app.n8n.cloud/webhook-test/d98a24da-0b97-41d8-96d5-3c546c5347d3';

        try {
            // Отправляем стандартный запрос с правильным заголовком JSON
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData) 
            });

            // Если скрипт дошел сюда и не выдал ошибку catch, значит запрос улетел!
            const formBox = document.querySelector('.action-box');
            formBox.innerHTML = `
                <div class="success-message">
                    <h3>Заявка успешно принята</h3>
                    <p>Доступ к системе Palantir готовится.<br>Мы свяжемся с вами в ближайшее время по указанным контактам.</p>
                </div>
            `;
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка отправки: ' + error.message);
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });

   /* =========================================
       6. Логика интерактивного тест-драйва (Demo Block)
       ========================================= */
    const demoForm = document.getElementById('demo-parser-form');
    const demoSubmitBtn = document.getElementById('demo-submit-btn');
    const demoResultsWrapper = document.getElementById('demo-results');
    const demoLoader = document.getElementById('demo-loader');
    const demoTableContainer = document.getElementById('demo-table-container');
    const demoStatusText = document.getElementById('demo-status-text');
    const demoLeadsTbody = document.getElementById('demo-leads-tbody');

    // Проверяем при загрузке страницы, отправлял ли уже пользователь запрос
    if (localStorage.getItem('palantir_demo_completed') === 'true') {
        if (demoSubmitBtn) {
            demoSubmitBtn.disabled = true;
            demoSubmitBtn.innerText = 'Демо-режим использован (1 запрос на устройство)';
            demoSubmitBtn.style.opacity = '0.5';
            demoSubmitBtn.style.cursor = 'not-allowed';
        }
    }

    if (demoForm) {
        // Собираем все поля в массив для удобной валидации
        const nicheSelect = document.getElementById('demo_niche');
        const chatInput = document.getElementById('demo_chat');
        const keywordsInput = document.getElementById('demo_keywords');
        const userTgInput = document.getElementById('demo_user_tg');
        const allFields = [nicheSelect, chatInput, keywordsInput, userTgInput];

        // Очищаем красную обводку, как только пользователь начинает исправлять ошибку
        allFields.forEach(field => {
            const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventType, function() {
                field.classList.remove('invalid-field');
            });
        });

        demoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Строгая проверка заполненности полей
            let isFormValid = true;
            allFields.forEach(field => {
                if (!field.value || !field.value.trim()) {
                    field.classList.add('invalid-field');
                    isFormValid = false;
                } else {
                    field.classList.remove('invalid-field');
                }
            });

            // Если хоть одно поле пустое — прерываем выполнение
            if (!isFormValid) {
                return;
            }
            
            const nicheText = nicheSelect.options[nicheSelect.selectedIndex].text;
            const chat = chatInput.value.trim();
            const keywords = keywordsInput.value.trim();
            const userTg = userTgInput.value.trim();
            
            // Умная нормализация ввода ссылки на чат для статус-бара
            let displayChat = chat;
            if (displayChat.includes('t.me/')) {
                displayChat = '@' + displayChat.split('t.me/')[1].split('/')[0].split('?')[0];
            } else if (!displayChat.startsWith('@')) {
                displayChat = '@' + displayChat;
            }
            
            demoSubmitBtn.disabled = true;
            demoSubmitBtn.innerText = 'Связь с парсером...';
            
            demoResultsWrapper.classList.remove('hidden');
            demoLoader.classList.remove('hidden');
            demoTableContainer.add && demoTableContainer.classList.add('hidden');
            
            const messages = [
                'Инициализация сессии технического аккаунта...',
                `Проверяем доступность чата ${displayChat}...`,
                'Сканируем последние 200 сообщений в истории...',
                `Фильтруем контент по ключевым словам: [ ${keywords} ]...`,
                'Формируем интерактивную таблицу горячих лидов...'
            ];
            
            let msgIdx = 0;
            demoStatusText.innerText = messages[msgIdx];
            const statusInterval = setInterval(() => {
                if (msgIdx < messages.length - 1) {
                    msgIdx++;
                    demoStatusText.innerText = messages[msgIdx];
                }
            }, 2200);
            
            // Переменные для интеграций
            const googleSheetUrl = "https://script.google.com/macros/s/AKfycbxfpvFvq6yKz6JgPX-kUgchyoGa-UbfXDC1BGV1crl1tm4kx46Mzrs6ABnLgSJ6Wz3vKg/exec"; 
            const localParserUrl = "http://127.0.0.1:8000/api/search-leads";
            
            const payloadData = {
                niche: nicheText,
                chat: chat,
                keywords: keywords,
                user_tg: userTg
            };

            // ЭТАП 1: Моментально сохраняем лида в Google Таблицу (работает в фоне)
            fetch(googleSheetUrl, {
                method: "POST",
                mode: "no-cors", // Позволяет отправлять данные без проблем со стороны Google безопасности
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadData)
            }).catch(err => console.log("Google Sheets Logging Bypass/Error: ", err));

            // ЭТАП 2: Основной запрос к твоему Python-парсеру на ПК
            fetch(localParserUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadData)
            })
            .then(response => {
                clearInterval(statusInterval);
                if (!response.ok) {
                    throw new Error("Ошибка при обработке запроса сервером парсера.");
                }
                return response.json();
            })
            .then(data => {
                demoLoader.classList.add('hidden');
                demoTableContainer.classList.remove('hidden');
                
                // Запоминаем компьютер пользователя, чтобы он больше не мог отправить форму
                localStorage.setItem('palantir_demo_completed', 'true');
                
                if (data.leads && data.leads.length > 0) {
                    demoLeadsTbody.innerHTML = data.leads.map(lead => `
                        <tr>
                            <td><span class="leads-username">${lead.username}</span></td>
                            <td>
                                "${lead.text}"
                                <br><span class="lead-keyword-badge">Триггер: ${lead.keyword}</span>
                            </td>
                            <td><a href="#" class="btn btn-outline" style="padding: 8px 14px; font-size: 12px;" onclick="alert('В демо-режиме прямые ссылки заблокированы. Полная версия Palantir позволяет писать клиенту в 1 клик.'); return false;">Открыть диалог</a></td>
                        </tr>
                    `).join('');
                } else {
                    demoLeadsTbody.innerHTML = `
                        <tr>
                            <td colspan="3" style="text-align: center; color: #64748b; padding: 40px;">
                                По вашим ключевым словам в этом чате за последнее время не нашлось горячих запросов.<br>
                                <span style="font-size: 12px; color: #475569;">Но мы проверили чат и отправили системный отчет на ваш Telegram!</span>
                            </td>
                        </tr>
                    `;
                }
                
                // Изменяем текст кнопки на финальный заблокированный
                demoSubmitBtn.innerText = 'Демо-режим использован (1 запрос на устройство)';
                demoSubmitBtn.style.opacity = '0.5';
                demoSubmitBtn.style.cursor = 'not-allowed';
                
                demoTableContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            })
            .catch(error => {
                clearInterval(statusInterval);
                console.error('Ошибка работы демо-теста:', error);
                alert('Не удалось получить ответ от локального парсера. Убедитесь, что на компьютере запущено черное окно uvicorn.');
                
                demoSubmitBtn.disabled = false;
                demoSubmitBtn.innerText = 'Найти лидов';
                demoLoader.classList.add('hidden');
            });
        });
    }
    
});
