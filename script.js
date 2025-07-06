document.addEventListener('DOMContentLoaded', () => {
    // Variable global para almacenar los datos de las secciones
    let siteData = {};

    // --- Función para cargar datos desde JSON/Markdown ---
    async function loadData() {
        try {
            const globalResponse = await fetch('/_data/site_data.json');
            siteData.global = await globalResponse.json();

            const newsResponse = await fetch('/_data/news.json');
            siteData.news = await newsResponse.json();

            const offersResponse = await fetch('/_data/offers.json');
            siteData.offers = await offersResponse.json();

            const holidaysResponse = await fetch('/_data/holidays.json');
            siteData.holidays = await holidaysResponse.json();

            // Cargar datos de contacto desde la nueva colección
            const contactResponse = await fetch('/_data/contact_data.json');
            siteData.contact = await contactResponse.json();

            const historyResponse = await fetch('/_data/history.md');
            const historyText = await historyResponse.text();
            // Nueva función para parsear Markdown con frontmatter
            siteData.history = parseMarkdownWithFrontmatter(historyText);

            const aboutResponse = await fetch('/_data/about.md');
            const aboutText = await aboutResponse.text();
            siteData.about = parseMarkdown(aboutText);


            // Una vez cargados todos los datos, inicializar componentes
            initializePageContent();
            initializeCarousel();
            initializeCalendar();
            initializeExpandableCards();
            initializeContactFormAndInfo();
            checkActiveSection(); // Revisa la sección activa al cargar
        } catch (error) {
            console.error('Error al cargar los datos del sitio:', error);
            console.error('Detalles del error:', error.message, error.stack);
            // Fallback: intentar inicializar con los datos que se hayan cargado o con valores predeterminados
            initializePageContent();
            initializeCarousel();
            initializeCalendar();
            initializeExpandableCards();
            initializeContactFormAndInfo();
            checkActiveSection();
        }
    }

    // Función para parsear Markdown (sin frontmatter)
    function parseMarkdown(markdownText) {
        let html = markdownText
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
            .replace(/^(?!<h|<ul|<li|<p>)(.*$)/gim, '<p>$1</p>');

        if (html.includes('<li>')) {
            html = `<ul>${html}</ul>`;
        }

        html = html.split('\n\n').map(p => {
            if (!p.startsWith('<h') && !p.startsWith('<ul') && !p.startsWith('<p>')) {
                return `<p>${p.replace(/\n/g, '<br>')}</p>`;
            }
            return p;
        }).join('');

        return html;
    }

    // Nueva función para parsear Markdown con frontmatter
    function parseMarkdownWithFrontmatter(markdownText) {
        const frontmatterRegex = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
        const match = markdownText.match(frontmatterRegex);

        let frontmatter = {};
        let body = markdownText;

        if (match) {
            const frontmatterContent = match[1];
            body = match[2];

            // Parsing simple de YAML frontmatter (key: value)
            frontmatterContent.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    const parts = trimmedLine.split(':');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join(':').trim();
                        // Remover comillas si existen (para URLs de imagen, etc.)
                        frontmatter[key] = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
                    }
                }
            });
        }

        return {
            frontmatter: frontmatter,
            body: parseMarkdown(body) // Usar la función parseMarkdown para el cuerpo
        };
    }

    // --- Inicializar contenido estático y dinámico ---
    function initializePageContent() {
        // Logo
        const mainLogoElement = document.getElementById('main-logo');
        if (mainLogoElement && siteData.global && siteData.global.logo_image) {
            mainLogoElement.src = siteData.global.logo_image;
        }

        // Títulos de Sección
        const titles = {
            'news-section-title': 'news_title', // Nuevo título para la sección de noticias
            'about-title': 'about_title',
            'calendar-section-title': 'calendar_title',
            'offers-section-title': 'offers_title',
            'history-section-title': 'history_title',
            'contact-form-title': 'form_contact_title',
            'contact-info-title': 'contact_info_title',
            'location-section-title': 'location_title'
        };

        for (const id in titles) {
            const element = document.getElementById(id);
            const propName = titles[id];
            if (element && siteData.global && siteData.global[propName]) {
                element.textContent = siteData.global[propName];
            }
        }

        // Contenido de Nosotros
        const aboutContentElement = document.getElementById('about-content');
        if (aboutContentElement && siteData.about) {
            aboutContentElement.innerHTML = siteData.about;
        }

        // Contenido e imagen de Historia
        const historyContentElement = document.getElementById('history-content');
        const historySectionImageElement = document.getElementById('history-section-image');
        if (siteData.history) {
            if (historyContentElement) {
                historyContentElement.innerHTML = siteData.history.body;
            }
            if (historySectionImageElement && siteData.history.frontmatter && siteData.history.frontmatter.section_image_history) {
                historySectionImageElement.src = siteData.history.frontmatter.section_image_history;
            }
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
        const newsItems = siteData.news && siteData.news.news ? siteData.news.news : [];

        if (!newsCarouselWrapper || newsItems.length === 0) {
            if (newsCarouselWrapper) {
                newsCarouselWrapper.innerHTML = '<p>No hay noticias disponibles.</p>';
            }
            // Ocultar botones y puntos si no hay noticias
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
            return;
        } else {
            // Asegurarse de que los botones y puntos estén visibles si hay noticias
            if (prevBtn) prevBtn.style.display = '';
            if (nextBtn) nextBtn.style.display = '';
            if (dotsContainer) dotsContainer.style.display = '';
        }

        const existingSlides = newsCarouselWrapper.querySelectorAll('.carousel-slide');
        existingSlides.forEach(slide => slide.remove());
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
        }

        newsItems.forEach((item, index) => {
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

            if (dotsContainer) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    currentSlide = index;
                    showSlide(currentSlide);
                    resetCarouselInterval();
                });
                dotsContainer.appendChild(dot);
            }
        });

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
        clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, 5000);
    }

    function resetCarouselInterval() {
        clearInterval(carouselInterval);
        startCarousel();
    }

    // --- Scroll Suave para Menú y Resaltado de Opción Activa ---
    const scrollLinks = document.querySelectorAll('.scroll-link');
    // Colección de elementos que deben ser rastreados para resaltar el menú activo
    const scrollTrackElements = document.querySelectorAll('section[id], div#nosotros');
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
        let currentActiveSectionId = 'inicio'; // Default a 'inicio'
        const headerOffset = header ? header.offsetHeight : 0;
        const activationMargin = 100; // Un margen para activar el enlace antes de que la sección esté completamente en la parte superior

        scrollTrackElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            // Calcula la posición del elemento relativa al documento, ajustada por el offset del header
            const offset = window.pageYOffset + rect.top - headerOffset;

            // Si la posición actual de scroll está dentro de los límites del elemento
            if (window.pageYOffset >= offset - activationMargin && window.pageYOffset < offset + element.offsetHeight - activationMargin) {
                currentActiveSectionId = element.id;
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
        setTimeout(checkActiveSection, 100); // Pequeño retraso para asegurar que todos los elementos estén renderizados
    });

    // --- Formulario de Contacto (Validación Básica) ---
    function initializeContactFormAndInfo() {
        const contactForm = document.getElementById('contactForm');
        const formMessages = document.getElementById('form-messages');

        // Actualizar información de contacto desde siteData.contact
        const contactPhone = document.getElementById('contact-phone');
        const contactAddress = document.getElementById('contact-address');
        const instagramLink = document.getElementById('instagram-link');
        const instagramHandle = document.getElementById('instagram-handle');

        if (siteData.contact) {
            if (contactPhone && siteData.contact.contact_phone) {
                contactPhone.textContent = siteData.contact.contact_phone;
            }
            if (contactAddress && siteData.contact.contact_address) {
                contactAddress.textContent = siteData.contact.contact_address;
            }
            if (instagramLink && siteData.contact.instagram_url) {
                instagramLink.href = siteData.contact.instagram_url;
            }
            if (instagramHandle && siteData.contact.instagram_handle) {
                instagramHandle.textContent = siteData.contact.instagram_handle;
            }
        }

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
        const offerItems = siteData.offers && siteData.offers.offers ? siteData.offers.offers : [];

        if (!offerCardsContainer || offerItems.length === 0) {
            if (offerCardsContainer) {
                offerCardsContainer.innerHTML = '<p>No hay ofertas académicas disponibles.</p>';
            }
            return;
        }

        offerCardsContainer.innerHTML = '';

        offerItems.forEach(offer => {
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

    let currentDate = new Date();

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

        if (currentHolidayTooltip) {
            currentHolidayTooltip.remove();
            currentHolidayTooltip = null;
        }

        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

        if (prevMonthBtn) {
            prevMonthBtn.onclick = () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
            };
        }
        if (nextMonthBtn) {
            nextMonthBtn.onclick = () => {
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

            const holiday = siteData.holidays && siteData.holidays.holidays ?
                            siteData.holidays.holidays.find(h => h.month === month + 1 && h.day === day) : null;
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
