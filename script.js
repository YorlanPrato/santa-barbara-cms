document.addEventListener('DOMContentLoaded', () => {
    // --- Carrusel de Noticias ---
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    let carouselInterval;

    function showSlide(index) {
        if (!slides || slides.length === 0) return; // Añadido: Comprueba si hay slides
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
        updateDots(index);
    }

    function updateDots(index) {
        if (!dotsContainer || !slides || slides.length === 0) return; // Añadido: Comprueba si hay dotsContainer y slides
        dotsContainer.innerHTML = ''; // Limpiar dots existentes
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === index) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                currentSlide = i;
                showSlide(currentSlide);
                resetCarouselInterval();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function nextSlide() {
        if (!slides || slides.length === 0) return;
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        if (!slides || slides.length === 0) return;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startCarousel() {
        if (!slides || slides.length === 0) return;
        carouselInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
    }

    function resetCarouselInterval() {
        clearInterval(carouselInterval);
        startCarousel();
    }

    // Inicializar carrusel si hay slides
    if (slides && slides.length > 0) {
        showSlide(currentSlide);
        startCarousel();

        // Detener carrusel al pasar el mouse, reanudar al quitarlo (opcional, pero buena UX)
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('mouseenter', () => clearInterval(carouselInterval));
            carouselWrapper.addEventListener('mouseleave', startCarousel);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetCarouselInterval(); // Reinicia el intervalo después de un clic manual
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetCarouselInterval(); // Reinicia el intervalo después de un clic manual
            });
        }
    }


    // --- Scroll Suave para Menú y Resaltado de Opción Activa ---
    const scrollLinks = document.querySelectorAll('.scroll-link');
    const sections = document.querySelectorAll('section');
    const header = document.querySelector('.main-header'); // Referencia al header

    function activateNavLink(id) {
        scrollLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
            }
        });
    }

    function checkActiveSection() {
        let currentActiveSectionId = 'inicio'; // Por defecto si no se ha scrolleado
        const headerOffset = header ? header.offsetHeight : 0; // Altura del header fijo, si existe

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Ajusta el cálculo para tener en cuenta la altura del header fijo
            const offset = window.pageYOffset + rect.top - headerOffset;

            // Define un margen de activación para que el link se active un poco antes de llegar a la sección
            const activationMargin = 100; // Ajusta este valor si es necesario

            if (window.pageYOffset >= offset - activationMargin && window.pageYOffset < offset + section.offsetHeight - activationMargin) {
                currentActiveSectionId = section.id;
            }
        });
        activateNavLink(currentActiveSectionId);
    }

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerOffset = header ? header.offsetHeight : 0; // Offset dinámico

            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    window.addEventListener('scroll', checkActiveSection);
    // Ejecutar checkActiveSection al cargar la página con un pequeño retraso para asegurar que el DOM esté renderizado
    window.addEventListener('load', () => {
        setTimeout(checkActiveSection, 100);
    });

    // --- Formulario de Contacto (Validación Básica - CAPTCHA ELIMINADO) ---
    const contactForm = document.getElementById('contactForm');
    const formMessages = document.getElementById('form-messages');

    if (contactForm) { // Asegura que el formulario exista
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita el envío por defecto del formulario

            // Simula el envío de datos
            const formData = new FormData(contactForm);
            const name = formData.get('nombre');
            const subject = formData.get('asunto');
            const email = formData.get('email');
            const message = formData.get('mensaje');

            // Validación básica (puedes añadir más si es necesario)
            if (!name || !subject || !email || !message) {
                displayMessage('Por favor, completa todos los campos del formulario.', 'error');
                return;
            }

            // Aquí iría la lógica para enviar el formulario a un servidor (AJAX/Fetch API)
            // Por ahora, simulamos un envío exitoso.
            console.log('Formulario enviado:', { name, subject, email, message });

            displayMessage('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 'success');
            contactForm.reset(); // Limpia el formulario
        });
    }

    function displayMessage(message, type) {
        if (formMessages) { // Asegura que el contenedor de mensajes exista
            formMessages.textContent = message;
            formMessages.className = 'form-messages ' + type; // Asigna la clase CSS para éxito o error
            formMessages.style.display = 'block'; // Muestra el mensaje

            // Ocultar el mensaje después de 5 segundos
            setTimeout(() => {
                formMessages.style.display = 'none';
            }, 5000);
        }
    }


    // --- Funcionalidad de Recuadros Ampliables en Oferta Académica ---
    const expandableCards = document.querySelectorAll('.expandable-card');

    expandableCards.forEach(card => {
        const header = card.querySelector('.card-header');
        const toggleButton = card.querySelector('.expand-toggle');

        function toggleCardExpansion() {
            const isCurrentlyExpanded = card.classList.contains('expanded');

            expandableCards.forEach(otherCard => {
                otherCard.classList.remove('expanded');
                // Asegúrate de que el botón exista antes de intentar cambiar su texto
                const otherToggleButton = otherCard.querySelector('.expand-toggle');
                if (otherToggleButton) {
                    otherToggleButton.textContent = '+';
                }
            });

            if (!isCurrentlyExpanded) {
                card.classList.add('expanded');
                if (toggleButton) { // Asegura que el botón exista
                    toggleButton.textContent = '-';
                }
            }
        }

        if (header) { // Asegura que el header exista
            header.addEventListener('click', toggleCardExpansion);
        }

        if (toggleButton) { // Asegura que el botón exista
            toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCardExpansion();
            });
        }
    });

    // --- Calendario Dinámico ---
    const calendarDatesElement = document.getElementById('calendarDates');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // Variable global para mantener el seguimiento del tooltip actual
    let currentHolidayTooltip = null;

    function showHolidayTooltip(message, targetElement) {
        // Oculta cualquier tooltip existente primero
        if (currentHolidayTooltip) {
            currentHolidayTooltip.remove();
            currentHolidayTooltip = null;
        }

        const tooltip = document.createElement('div');
        tooltip.classList.add('holiday-tooltip');
        tooltip.textContent = message;
        document.body.appendChild(tooltip); // Añade al body para posicionamiento absoluto

        currentHolidayTooltip = tooltip; // Guarda la referencia al nuevo tooltip

        // Posiciona el tooltip
        const rect = targetElement.getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        // Dale un momento al navegador para renderizar el tooltip y calcular su tamaño
        requestAnimationFrame(() => {
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            // Calcula la posición: encima del elemento objetivo, centrado horizontalmente
            // 10px de margen encima de la celda objetivo
            let topPosition = rect.top + scrollY - tooltipHeight - 10;
            let leftPosition = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);

            // Comprobación de límites básicos: si se sale por la parte superior de la pantalla, posiciona debajo
            if (topPosition < 0) {
                topPosition = rect.bottom + scrollY + 10;
                tooltip.classList.add('below'); // Añade clase para ajustar la dirección de la flecha
            } else {
                tooltip.classList.remove('below'); // Asegura que no tenga la clase "below" si se posiciona arriba
            }

            tooltip.style.top = `${topPosition}px`;
            tooltip.style.left = `${leftPosition}px`;
            tooltip.style.opacity = '1'; // Hazlo visible después del posicionamiento
            tooltip.style.transform = tooltip.classList.contains('below') ? 'translateY(0)' : 'translateY(0)'; // Elimina el desplazamiento inicial
        });

        // Añade un listener de clic global para ocultar el tooltip al hacer clic en otro lugar
        // Solo añádelo si no se ha añadido ya (usa una bandera para rastrearlo)
        if (!document.body.dataset.tooltipClickListenerAdded) {
            document.addEventListener('click', hideHolidayTooltipOnClickOutside);
            document.body.dataset.tooltipClickListenerAdded = 'true';
        }
    }

    function hideHolidayTooltipOnClickOutside(event) {
        // Si hay un tooltip activo y el clic no está dentro del tooltip en sí
        // Y no es en una celda de calendario de día festivo (para permitir hacer clic en otra celda de día festivo para abrir un nuevo tooltip)
        if (currentHolidayTooltip &&
            !currentHolidayTooltip.contains(event.target) &&
            !event.target.closest('.calendar-date-cell.holiday')
        ) {
            currentHolidayTooltip.style.opacity = '0'; // Comienza el fundido
            currentHolidayTooltip.style.transform = currentHolidayTooltip.classList.contains('below') ? 'translateY(-10px)' : 'translateY(10px)'; // Retorna al desplazamiento inicial
            setTimeout(() => { // Elimina después de que la transición se complete
                if (currentHolidayTooltip) { // Vuelve a comprobar por si se reabrió durante el timeout
                    currentHolidayTooltip.remove();
                    currentHolidayTooltip = null;
                    document.body.dataset.tooltipClickListenerAdded = ''; // Reinicia la bandera
                    document.removeEventListener('click', hideHolidayTooltipOnClickOutside); // Elimina el listener
                }
            }, 200); // Coincide con la duración de la transición CSS
        }
    }


    function generateCalendar(year, month) {
        if (!calendarDatesElement || !currentMonthYearElement) return; // Añadido: Comprobación de existencia de elementos

        calendarDatesElement.innerHTML = ''; // Limpiar celdas anteriores

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 6 = Sábado

        // Actualizar el título del mes y año
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        currentMonthYearElement.textContent = `${monthNames[month]} ${year}`;

        // Rellenar días del mes anterior (vacíos al inicio)
        for (let i = 0; i < firstDayOfWeek; i++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-date-cell', 'other-month');
            calendarDatesElement.appendChild(cell);
        }

        // Rellenar días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-date-cell', 'current-month');
            cell.textContent = day;

            const currentDay = new Date(year, month, day);

            // Marcar el día de hoy
            if (currentDay.toDateString() === new Date().toDateString()) {
                cell.classList.add('today');
            }

            // Marcar días festivos y añadir descripción al hacer click
            const holiday = holidays.find(h => h.month === month && h.day === day);
            if (holiday) {
                cell.classList.add('holiday');
                cell.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evita que el clic en el documento oculte inmediatamente este tooltip
                    showHolidayTooltip(holiday.name, cell);
                });
            }

            calendarDatesElement.appendChild(cell);
        }

        // Rellenar días del mes siguiente (vacíos al final para completar la semana)
        const totalCells = firstDayOfWeek + daysInMonth;
        let cellsToAdd = 0;
        if (totalCells < 35) { // Si el calendario tiene menos de 5 semanas completas, añade hasta 5
            cellsToAdd = 35 - totalCells;
        } else if (totalCells > 35 && totalCells < 42) { // Si tiene entre 5 y 6 semanas, completa hasta 6
            cellsToAdd = 42 - totalCells;
        }


        for (let i = 0; i < cellsToAdd; i++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-date-cell', 'other-month');
            calendarDatesElement.appendChild(cell);
        }
    }

    // Navegación del calendario
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }

    if (nextMonthBtn) { // Corregido: nextDate a nextMonthBtn
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }

    // Inicializar calendario al cargar la página si los elementos existen
    if (calendarDatesElement && currentMonthYearElement && prevMonthBtn && nextMonthBtn) {
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    }
});