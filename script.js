
document.addEventListener('DOMContentLoaded', () => {
    async function cargarContenidoCMS() {
        // Cargar texto institucional
        const home = await fetch('./content/home.md').then(r => r.text());
        const match = home.match(/---[\s\S]+?---\s*(.*)/);
        if (match) {
            document.getElementById('descripcionInstitucional').innerHTML = marked.parse(match[1]);
            const titulo = home.match(/titulo: (.+)/);
            if (titulo) document.getElementById('tituloInstitucional').textContent = titulo[1];
        }

        // Cargar contacto
        const contacto = await fetch('./content/contacto.md').then(r => r.text());
        const tel = contacto.match(/telefono: (.+)/)[1];
        const dir = contacto.match(/direccion: (.+)/)[1];
        document.getElementById('telefonoContacto').textContent = tel;
        document.getElementById('direccionContacto').textContent = dir;

        // Cargar noticias desde JSON index generado (se asume un generador estático)
        try {
            const noticias = await fetch('./content/noticias/index.json').then(r => r.json());
            const wrapper = document.getElementById('carousel-wrapper');
            noticias.slice(0, 5).forEach((n, i) => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
                slide.innerHTML = \`
                    <img src="\${n.imagen}" alt="\${n.titulo}">
                    <div class="carousel-caption">
                        <h4>\${n.titulo}</h4>
                        <p>\${n.descripcion}</p>
                    </div>\`;
                wrapper.appendChild(slide);
            });
        } catch (err) {
            console.error('Error cargando noticias:', err);
        }
    }

    cargarContenidoCMS();
});
