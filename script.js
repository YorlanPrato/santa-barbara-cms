document.addEventListener('DOMContentLoaded', () => {
    // Variable global para almacenar los datos de las secciones
    let siteData = {};

    // --- Función para cargar datos desde JSON/Markdown ---
    async function loadData() {
        try {
            // Cargar datos de configuración global (ej. contacto, información de inicio)
            const globalResponse = await fetch('/_data/site_data.json');
            siteData.global = await globalResponse.json();

            // Cargar noticias
            const newsResponse = await fetch('/_data/news.json');
            siteData.news = await newsResponse.json();

            // Cargar ofertas académicas
            const offersResponse = await fetch('/_data/offers.json');
            siteData.offers = await offersResponse.json();

            // Cargar días festivos
            const holidaysResponse = await fetch('/_data/holidays.json');
            siteData.holidays = await holidaysResponse.json();

            // Cargar contenido de la historia (como un markdown simple)
            const historyResponse = await fetch('/_data/history.md');
            const historyText = await historyResponse.text();
            siteData.history = parseMarkdown(historyText);

            // Cargar contenido de "Nosotros" (como un markdown simple)
            const aboutResponse = await fetch('/_data/about.md');
            const aboutText = await aboutResponse.text();
            siteData.about = parseMarkdown(aboutText);


            // Una vez cargados todos los datos, inicializar componentes
            initializePageContent();
            initializeCarousel();
            initializeCalendar();
            initializeExpandableCards();
            initializeContactFormAndInfo();
            checkActiveSection(); // Para asegurar que la sección inicial esté activa
        } catch (error) {
            console.error('Error loading site data:', error);
            // Fallback a contenido estático o mostrar mensaje de error
            initializePageContent(); // Intenta inicializar con lo que haya
            initializeCarousel();
            initializeCalendar();
            initializeExpandableCards();
            initializeContactFormAndInfo();
            checkActiveSection();
        }
    }

    // Función simple para parsear Markdown a HTML básico
    function parseMarkdown(markdownText) {
        let html = markdownText
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
            .replace(/^(?!<h|<ul|<li|<p>)(.*$)/gim, '<p>$1</p>'); // Wrap lines not starting with known tags in p
        
        // Wrap li elements in ul if they exist (simple approach)
        if (html.includes('<li>')) {
            html = `<ul>${html}</ul>`;
        }
        
        // Convert double newlines to <p> tags
        html = html.split('\n\n').map(p => {
            if (!p.startsWith('<h') && !p.startsWith('<ul')) {
                return `<p>${p.replace(/\n/g, '<br>')}</p>`; // Replace single newlines with <br> inside paragraphs
            }
            return p;
        }).join('');
        
        return html;
    }


    // --- Inicializar contenido estático y dinámico ---
    function initializePageContent() {
        // Sección "Nosotros"
        const aboutTitleElement = document.getElementById('about-title');
        const aboutContentElement = document.getElementById('about-content');
        if (siteData.global && siteData.global.about_title) {
            aboutTitleElement.textContent = siteData.global.about_title;
        }
        if (siteData.about) {
            aboutContentElement.innerHTML = siteData.about;
        }

        // Sección "Historia"
        const historyTitleElement = document.getElementById('history-title');
        const historyContentElement = document.getElementById('history-content');
        const historyImageElement = document.getElementById('history-image');
        if (siteData.global && siteData.global.history_title) {
            historyTitleElement.textContent = siteData.global.history_title;
        }
        if (siteData.history) {
            historyContentElement.innerHTML = siteData.history;
        }
        if (siteData.global && siteData.global.history_image) {
            historyImageElement.src = siteData.global.history_image;
        }

        // Información de Contacto
        const contactPhone = document.getElementById('contact-phone');
        const contactAddress = document.getElementById('contact-address');
        const instagramLink = document.getElementById('instagram-link');
        const instagramHandle = document.getElementById('instagram-handle');
        const contactMap = document.getElementById('contact-map');

        if (siteData.global) {
            if (siteData.global.contact_phone) contactPhone.textContent = siteData.global.contact_phone;
            if (siteData.global.contact_address) contactAddress.textContent = siteData.global.contact_address;
            if (siteData.global.instagram_url) instagramLink.href = siteData.global.instagram_url;
            if (siteData.global.instagram_handle) instagramHandle.textContent = siteData.global.instagram_handle;
            if (siteData.global.map_embed_url) contactMap.src = siteData.global.map_embed_url;
        }
    }


    // --- Carrusel de Noticias ---
    let currentSlide = 0;
    let carouselInterval;
    const newsCarouselWrapper = document.getElementById('news-carousel-wrapper');
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    function initializeCarousel() {
        if (!newsCarouselWrapper || !siteData.news || siteData.news.length === 0) {
            newsCarouselWrapper.innerHTML = '<p>No hay noticias disponibles.</p>';
            return;
        }

        newsCarouselWrapper.innerHTML = ''; // Limpiar contenido existente
        dotsContainer.innerHTML = ''; // Limpiar dots existentes

        siteData.news.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.classList.add('carousel-slide');
            if (index === 0) slide.classList.add('active');

            slide.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="carousel-caption">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            newsCarouselWrapper.appendChild(slide);

            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                resetCarouselInterval();
            });
            dotsContainer.appendChild(dot);
        });

        // Asegurarse de que los botones de navegación estén presentes (ya están en HTML)
        // Y añadir los listeners de evento aquí, después de que los slides existan
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetCarouselInterval();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetCarouselInterval();
            });
        }

        startCarousel();

        const carouselContainer = document.querySelector('.news-carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselInterval));
            carouselContainer.addEventListener('mouseleave', startCarousel);
        }
    }

    function showSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        if (!slides || slides.length === 0) return;
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
        updateDots(index);
    }

    function updateDots(index) {
        const dots = document.querySelectorAll('.carousel-dots .dot');
        if (!dots || dots.length === 0) return;
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) {
                dot.classList.add('active');
            }
        });
    }

    function nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (!slides || slides.length === 0) return;
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (!slides || slides.length === 0) return;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (!slides || slides.length === 0) return;
        clearInterval(carouselInterval); // Asegura que no haya intervalos duplicados
        carouselInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
    }

    function resetCarouselInterval() {
        clearInterval(carouselInterval);
        startCarousel();
    }


    // --- Scroll Suave para Menú y Resaltado de Opción Activa ---
    const scrollLinks = document.querySelectorAll('.scroll-link');
    const sections = document.querySelectorAll('section');
    const header = document.querySelector('.main-header');

    function activateNavLink(id) {
        scrollLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
            }
        });
    }

    function checkActiveSection() {
        let currentActiveSectionId = 'inicio';
        const headerOffset = header ? header.offsetHeight : 0;
        const activationMargin = 100;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const offset = window.pageYOffset + rect.top - headerOffset;

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
            const headerOffset = header ? header.offsetHeight : 0;

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
    window.addEventListener('load', () => {
        setTimeout(checkActiveSection, 100);
    });

    // --- Formulario de Contacto (Validación Básica) ---
    function initializeContactFormAndInfo() {
        const contactForm = document.getElementById('contactForm');
        const formMessages = document.getElementById('form-messages');

        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(contactForm);
                const name = formData.get('nombre');
                const subject = formData.get('asunto');
                const email = formData.get('email');
                const message = formData.get('mensaje');

                if (!name || !subject || !email || !message) {
                    displayMessage('Por favor, completa todos los campos del formulario.', 'error');
                    return;
                }

                // Aquí iría la lógica para enviar el formulario a un servidor
                // Netlify Forms maneja esto automáticamente si el HTML tiene el atributo data-netlify="true"
                // y configuras la redirección o un mensaje de éxito en Netlify.
                // Para demostración, simulamos un envío exitoso.
                console.log('Formulario enviado:', { name, subject, email, message });

                displayMessage('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 'success');
                contactForm.reset();
            });
        }

        function displayMessage(message, type) {
            if (formMessages) {
                formMessages.textContent = message;
                formMessages.className = 'form-messages ' + type;
                formMessages.style.display = 'block';
                setTimeout(() => {
                    formMessages.style.display = 'none';
                }, 5000);
            }
        }
    }


    // --- Funcionalidad de Recuadros Ampliables en Oferta Académica ---
    function initializeExpandableCards() {
        const offerCardsContainer = document.getElementById('offer-cards-container');
        if (!offerCardsContainer || !siteData.offers || siteData.offers.length === 0) {
            offerCardsContainer.innerHTML = '<p>No hay ofertas académicas disponibles.</p>';
            return;
        }

        offerCardsContainer.innerHTML = ''; // Limpiar contenido existente

        siteData.offers.forEach(offer => {
            const card = document.createElement('div');
            card.classList.add('offer-card', 'expandable-card', offer.color_class);

            card.innerHTML = `
                <div class="card-header">
                    <h3>${offer.title.replace(/\n/g, '<br>')}</h3>
                    <button class="expand-toggle">+</button>
                </div>
                <div class="card-content">
                    <p>${offer.content}</p>
                </div>
            `;
            offerCardsContainer.appendChild(card);
        });

        const expandableCards = document.querySelectorAll('.expandable-card');
        expandableCards.forEach(card => {
            const header = card.querySelector('.card-header');
            const toggleButton = card.querySelector('.expand-toggle');

            function toggleCardExpansion() {
                const isCurrentlyExpanded = card.classList.contains('expanded');

                expandableCards.forEach(otherCard => {
                    otherCard.classList.remove('expanded');
                    const otherToggleButton = otherCard.querySelector('.expand-toggle');
                    if (otherToggleButton) {
                        otherToggleButton.textContent = '+';
                    }
                });

                if (!isCurrentlyExpanded) {
                    card.classList.add('expanded');
                    if (toggleButton) {
                        toggleButton.textContent = '-';
                    }
                }
            }

            if (header) {
                header.addEventListener('click', toggleCardExpansion);
            }
            if (toggleButton) {
                toggleButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleCardExpansion();
                });
            }
        });
    }

    // --- Calendario Dinámico ---
    const calendarDatesElement = document.getElementById('calendarDates');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    let currentDate = new Date(); // Mover aquí para que sea global en el contexto del script

    // Variable global para mantener el seguimiento del tooltip actual
    let currentHolidayTooltip = null;

    function showHolidayTooltip(message, targetElement) {
        if (currentHolidayTooltip) {
            currentHolidayTooltip.remove();
            currentHolidayTooltip = null;
        }

        const tooltip = document.createElement('div');
        tooltip.classList.add('holiday-tooltip');
        tooltip.textContent = message;
        document.body.appendChild(tooltip);

        currentHolidayTooltip = tooltip;

        const rect = targetElement.getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        requestAnimationFrame(() => {
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            let topPosition = rect.top + scrollY - tooltipHeight - 10;
            let leftPosition = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);

            if (topPosition < 0) {
                topPosition = rect.bottom + scrollY + 10;
                tooltip.classList.add('below');
            } else {
                tooltip.classList.remove('below');
            }

            tooltip.style.top = `${topPosition}px`;
            tooltip.style.left = `${leftPosition}px`;
            tooltip.style.opacity = '1';
            tooltip.style.transform = tooltip.classList.contains('below') ? 'translateY(0)' : 'translateY(0)';
        });

        if (!document.body.dataset.tooltipClickListenerAdded) {
            document.addEventListener('click', hideHolidayTooltipOnClickOutside);
            document.body.dataset.tooltipClickListenerAdded = 'true';
        }
    }

    function hideHolidayTooltipOnClickOutside(event) {
        if (currentHolidayTooltip &&
            !currentHolidayTooltip.contains(event.target) &&
            !event.target.closest('.calendar-date-cell.holiday')
        ) {
            currentHolidayTooltip.style.opacity = '0';
            currentHolidayTooltip.style.transform = currentHolidayTooltip.classList.contains('below') ? 'translateY(-10px)' : 'translateY(10px)';
            setTimeout(() => {
                if (currentHolidayTooltip) {
                    currentHolidayTooltip.remove();
                    currentHolidayTooltip = null;
                    document.body.dataset.tooltipClickListenerAdded = '';
                    document.removeEventListener('click', hideHolidayTooltipOnClickOutside);
                }
            }, 200);
        }
    }

    function initializeCalendar() {
        if (!calendarDatesElement || !currentMonthYearElement) return;

        // Limpiar cualquier tooltip activo al cambiar el calendario
        if (currentHolidayTooltip) {
            currentHolidayTooltip.remove();
            currentHolidayTooltip = null;
        }

        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

        if (prevMonthBtn) {
            prevMonthBtn.onclick = () => { // Usar onclick para evitar duplicados si se llama initializeCalendar varias veces
                currentDate.setMonth(currentDate.getMonth() - 1);
                generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
            };
        }
        if (nextMonthBtn) {
            nextMonthBtn.onclick = () => { // Usar onclick
                currentDate.setMonth(currentDate.getMonth() + 1);
                generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
            };
        }
    }

    function generateCalendar(year, month) {
        if (!calendarDatesElement || !currentMonthYearElement) return;

        calendarDatesElement.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay();

        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        currentMonthYearElement.textContent = `${monthNames[month]} ${year}`;

        for (let i = 0; i < firstDayOfWeek; i++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-date-cell', 'other-month');
            calendarDatesElement.appendChild(cell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-date-cell', 'current-month');
            cell.textContent = day;

            const currentDay = new Date(year, month, day);

            if (currentDay.toDateString() === new Date().toDateString()) {
                cell.classList.add('today');
            }

            // Usar siteData.holidays para buscar días festivos
            const holiday = siteData.holidays ? siteData.holidays.find(h => h.month === month + 1 && h.day === day) : null; // Month in JSON is 1-indexed
            if (holiday) {
                cell.classList.add('holiday');
                cell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showHolidayTooltip(holiday.name, cell);
                });
            }

            calendarDatesElement.appendChild(cell);
        }

        const totalCells = firstDayOfWeek + daysInMonth;
        let cellsToAdd = 0;
        if (totalCells < 35) {
            cellsToAdd = 35 - totalCells;
        } else if (totalCells > 35 && totalCells < 42) {
            cellsToAdd = 42 - totalCells;
        }

        for (let i = 0; i < cellsToAdd; i++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-date-cell', 'other-month');
            calendarDatesElement.appendChild(cell);
        }
    }

    // Cargar todos los datos al inicio
    loadData();
});