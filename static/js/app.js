const API_BASE_URL = "https://myapi-pensiones.onrender.com/api";

// Función general de paginación para cualquier tabla
function renderTableWithPagination({data, theadId, tbodyId, paginationId, pageSize = 10, renderRow}) {
    const tbody = document.getElementById(tbodyId);
    const totalPages = Math.ceil(data.length / pageSize);
    let currentPage = 1;

    function renderPage(page) {
        tbody.innerHTML = '';
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageData = data.slice(start, end);
        pageData.forEach(row => {
            if (renderRow) {
                tbody.innerHTML += renderRow(row);
            } else {
                // Fallback: renderiza sin botones
                const keys = Object.keys(row);
                tbody.innerHTML += `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`;
            }
        });
        renderPagination(page);
    }

    function renderPagination(page) {
        const pagDiv = document.getElementById(paginationId);
        pagDiv.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn' + (i === page ? ' active' : '');
            btn.textContent = i;
            btn.disabled = i === page;
            btn.onclick = () => renderPage(i);
            pagDiv.appendChild(btn);
        }
    }

    renderPage(currentPage);
}

document.querySelector("#loginForm").addEventListener("submit", function (e) {
  // e.preventDefault();

  const email = document.querySelector('input[name="correo"]').value;
  const contrasenna = document.querySelector('input[name="password"]').value;
  const rol = 1;

  if (!email || !contrasenna) {
    document.querySelector(".error").textContent = "Debes ingresar correo y contraseña.";
    return;
  }

  fetch(`${API_BASE_URL}/v_usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,        // o "correo": email, según lo que espera la API
      contrasenna,
      rol
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.id_usuario) {
        // No redirigir aquí, deja que Django lo haga en la respuesta del POST tradicional
        document.querySelector(".error").textContent = "¡Login exitoso!";
        // O simplemente no hagas nada aquí
      } else {
        document.querySelector(".error").textContent = data.error || data.message || "Credenciales incorrectas";
      }
    })
    .catch((error) => {
      document.querySelector(".error").textContent = "Error de conexión";
      console.error(error);
    });
});

