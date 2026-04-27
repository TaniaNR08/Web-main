// RF01: Validación de login
function validarLogin(usuario, password) {
  if (!usuario || !password) {
    return false;
  }
  return true;
}

// RF05: Validación de formularios (ej. crear grupo)
function validarFormulario(nombre) {
  return nombre.trim() !== "";
}

// RNF05: Seguridad básica (evitar scripts)
function validarEntradaSegura(texto) {
  return !texto.includes("<script>");
}

// RNF01: Rendimiento básico (simulado)
function respuestaRapida(tiempoMs) {
  return tiempoMs < 3000;
}

module.exports = {
  validarLogin,
  validarFormulario,
  validarEntradaSegura,
  respuestaRapida
};
