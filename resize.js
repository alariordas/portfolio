document.addEventListener('DOMContentLoaded', function() {
    function interpolate(value, pointA, pointB) {
        return ((value - pointA.width) * (pointB.fontSize - pointA.fontSize) / (pointB.width - pointA.width)) + pointA.fontSize;
    }

    function adjustTextSize(container) {
        const textElement = container.querySelector('.text');
        const containerWidth = container.offsetWidth;

        // Leer puntos de interpolación del contenedor
        const minWidth = parseFloat(container.getAttribute('data-min-width'));
        const maxWidth = parseFloat(container.getAttribute('data-max-width'));

        const pointA = {
            width: minWidth,
            fontSize: parseFloat(container.getAttribute('data-min-fontsize')),
            minHeight: parseFloat(container.getAttribute('data-min-height'))
        };
        const pointB = {
            width: maxWidth,
            fontSize: parseFloat(container.getAttribute('data-max-fontsize')),
            minHeight: parseFloat(container.getAttribute('data-max-height'))
        };

        // Encuentra los puntos de interpolación relevantes
        if (containerWidth <= pointA.width) {
            // Si el ancho del contenedor es menor o igual al punto mínimo
            textElement.style.fontSize = `${pointA.fontSize}px`;
            container.style.minHeight = `${pointA.minHeight}px`;
            textElement.style.minHeight = `${pointA.minHeight}px`;
        } else if (containerWidth >= pointB.width) {
            // Si el ancho del contenedor es mayor o igual al punto máximo
            textElement.style.fontSize = `${pointB.fontSize}px`;
            container.style.minHeight = `${pointB.minHeight}px`;
            textElement.style.minHeight = `${pointB.minHeight}px`;
        } else {
            // Interpola entre los puntos
            const fontSize = interpolate(containerWidth, pointA, pointB);
            const minHeight = interpolate(containerWidth, pointA, pointB); // Usando la misma interpolación para minHeight
            textElement.style.fontSize = `${fontSize}px`;
            container.style.minHeight = `${minHeight}px`;
            textElement.style.minHeight = `${minHeight}px`;
        }

        // Asegura que el contenedor tenga un mínimo de altura y que el texto se ajuste
        const minHeight = parseFloat(getComputedStyle(container).minHeight);
        if (container.offsetHeight < minHeight) {
            container.style.minHeight = `${minHeight}px`;
        }
    }

    function makeResizableDiv(div) {
        const element = document.querySelector(div);
        const minimum_size = 20;

        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;

        // Función para permitir arrastrar el div
        element.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('resizer')) return;
            e.preventDefault();
            original_width = element.offsetWidth;
            original_height = element.offsetHeight;
            original_x = e.clientX;
            original_y = e.clientY;
            window.addEventListener('mousemove', dragElement);
            window.addEventListener('mouseup', stopDrag);
        });

        function dragElement(e) {
            const dx = e.clientX - original_x;
            const dy = e.clientY - original_y;
            element.style.left = (element.offsetLeft + dx) + 'px';
            element.style.top = (element.offsetTop + dy) + 'px';
            original_x = e.clientX;
            original_y = e.clientY;
        }

        function stopDrag() {
            window.removeEventListener('mousemove', dragElement);
            window.removeEventListener('mouseup', stopDrag);
        }

        // Funcionalidad de redimensionar
        const resizers = element.querySelectorAll('.resizer');
        resizers.forEach(currentResizer => {
            currentResizer.addEventListener('mousedown', function(e) {
                e.preventDefault();
                original_width = parseFloat(getComputedStyle(element).width);
                original_height = parseFloat(getComputedStyle(element).height);
                original_x = element.getBoundingClientRect().left;
                original_y = element.getBoundingClientRect().top;
                original_mouse_x = e.pageX;
                original_mouse_y = e.pageY;
                window.addEventListener('mousemove', resize);
                window.addEventListener('mouseup', stopResize);
            });

            function resize(e) {
                let width, height;
                if (currentResizer.classList.contains('bottom-right')) {
                    width = original_width + (e.pageX - original_mouse_x);
                    height = original_height + (e.pageY - original_mouse_y);
                } else if (currentResizer.classList.contains('bottom-left')) {
                    width = original_width - (e.pageX - original_mouse_x);
                    height = original_height + (e.pageY - original_mouse_y);
                    element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
                } else if (currentResizer.classList.contains('top-right')) {
                    width = original_width + (e.pageX - original_mouse_x);
                    height = original_height - (e.pageY - original_mouse_y);
                    element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
                } else {
                    width = original_width - (e.pageX - original_mouse_x);
                    height = original_height - (e.pageY - original_mouse_y);
                    element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
                    element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
                }

                if (width > minimum_size) {
                    element.style.width = width + 'px';
                }
                if (height > minimum_size) {
                    element.style.height = height + 'px';
                }

                // Ajustar el tamaño del texto usando la función de interpolación
                adjustTextSize(element);
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize);
            }
        });

        // Inicializar el ajuste del tamaño del texto
        adjustTextSize(element);
    }

    // Inicializar la funcionalidad de redimensionamiento
    makeResizableDiv('.resizable');
});
