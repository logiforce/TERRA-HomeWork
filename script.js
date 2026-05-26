// Ждем, пока вся страница загрузится
document.addEventListener("DOMContentLoaded", function() {
    
    // Находим наше навигационное меню по ID
    const navbar = document.getElementById("navbar");

    // Отслеживаем событие прокрутки (скролла)
    window.addEventListener("scroll", function() {
        // Если прокрутили больше 50 пикселей вниз
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled"); // Добавляем класс с тенью
        } else {
            navbar.classList.remove("scrolled"); // Убираем, если вернулись наверх
        }
    });
});
