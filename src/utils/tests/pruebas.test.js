const {
  validarLogin,
  validarFormulario,
  validarEntradaSegura,
  respuestaRapida
} = require("../validaciones");

console.log("=== INICIO DE PRUEBAS DEL SISTEMA ===");

// =============================
// RF01 - Autenticación de usuarios
// =============================
console.log("\n[RF01] Autenticación de usuarios");

if (validarLogin("", "") === false) {
  console.log("✅ CP-01 PASSED: No permite login con campos vacíos");
} else {
  console.log("❌ CP-01 FAILED");
}

if (validarLogin("admin", "1234") === true) {
  console.log("✅ CP-02 PASSED: Permite login con credenciales válidas");
} else {
  console.log("❌ CP-02 FAILED");
}

// =============================
// RF05 - Validación de formularios
// =============================
console.log("\n[RF05] Validación de formularios");

if (validarFormulario("") === false) {
  console.log("✅ CP-03 PASSED: No permite formulario vacío");
} else {
  console.log("❌ CP-03 FAILED");
}

if (validarFormulario("Grupo A") === true) {
  console.log("✅ CP-04 PASSED: Permite formulario con datos válidos");
} else {
  console.log("❌ CP-04 FAILED");
}

// =============================
// RNF05 - Seguridad básica
// =============================
console.log("\n[RNF05] Seguridad básica");

if (validarEntradaSegura("<script>alert('xss')</script>") === false) {
  console.log("✅ CP-05 PASSED: Bloquea código malicioso");
} else {
  console.log("❌ CP-05 FAILED");
}

if (validarEntradaSegura("Texto seguro") === true) {
  console.log("✅ CP-06 PASSED: Permite texto seguro");
} else {
  console.log("❌ CP-06 FAILED");
}

// =============================
// RNF01 - Rendimiento
// =============================
console.log("\n[RNF01] Rendimiento");

if (respuestaRapida(1500) === true) {
  console.log("✅ CP-07 PASSED: Respuesta en tiempo aceptable");
} else {
  console.log("❌ CP-07 FAILED");
}

if (respuestaRapida(4000) === false) {
  console.log("✅ CP-08 PASSED: Detecta tiempo de respuesta alto");
} else {
  console.log("❌ CP-08 FAILED");
}

console.log("\n=== FIN DE PRUEBAS ===");