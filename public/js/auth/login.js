function login(event) {
  event.preventDefault();

  const user = document.getElementById("user").value;
  const passwd = document.getElementById("passwd").value;

  fetch("http://localhost:3001/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: user,
      passwd: passwd
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById("feedbackText").innerText = data.error;
      } else {
        // guardar token si lo usas
        if (data.token) {
          sessionStorage.setItem("token", data.token);
        }
        sessionStorage.setItem("user", user);
        sessionStorage.setItem("passwd", passwd);

        window.location.href = data.redirect;
      }
    })
    .catch(error => {
      console.error("Error en el login:", error);
      document.getElementById("feedbackText").innerText =
        "Error del servidor.";
    });
}

document.querySelector("form").addEventListener("submit", login);