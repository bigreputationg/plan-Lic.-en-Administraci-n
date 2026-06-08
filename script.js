const TOTAL_MATERIAS = 28;

const materias = document.querySelectorAll(".materia");
const barra = document.getElementById("barra-progreso");
const texto = document.getElementById("texto-progreso");
const botonReset = document.getElementById("reiniciar");

const PRIMER_TRAMO = [
  "algebra",
  "analisis",
  "economia",
  "historia",
  "admin-general",
  "sociologia"
];

const SEGUNDO_TRAMO = [
  "estadistica",
  "teoria-contable",
  "derecho",
  "micro",
  "gestion-digital",
  "sistemas"
];

const OPTATIVAS = [
  "optativa1",
  "optativa2",
  "optativa3"
];

const correlativas = {
  "calculo-financiero": ["PRIMER"],
  "gestion-talento": ["PRIMER"],
  "gestion-costos": ["teoria-contable"],
  "macro": ["micro"],
  "operaciones": ["sistemas"],
  "metodos": ["estadistica"],
  "tributaria": ["macro"],
  "marketing": ["operaciones"],
  "admin-financiera": ["calculo-financiero"],
  "planeamiento": ["admin-financiera"],
  "ciencias-decision": ["metodos"],
  "direccion": ["gestion-talento", "ciencias-decision"]
};

let estados =
  JSON.parse(localStorage.getItem("planAdministracion")) || {};

function obtenerEstado(materia) {
  if (materia.classList.contains("aprobada")) return "aprobada";
  if (materia.classList.contains("cursando")) return "cursando";
  if (materia.classList.contains("habilitada")) return "habilitada";
  return "bloqueada";
}

function guardar() {
  localStorage.setItem(
    "planAdministracion",
    JSON.stringify(estados)
  );
}

function materiaAprobada(id) {
  const materia = document.querySelector(`[data-id="${id}"]`);
  return materia.classList.contains("aprobada");
}

function primerTramoCompleto() {
  return PRIMER_TRAMO.every(id => materiaAprobada(id));
}

function desbloquear(id) {
  const materia = document.querySelector(`[data-id="${id}"]`);

  if (materia.classList.contains("bloqueada")) {
    materia.classList.remove("bloqueada");
    materia.classList.add("habilitada");
    estados[id] = "habilitada";
  }
}

function actualizarCorrelativas() {

  if (primerTramoCompleto()) {

    SEGUNDO_TRAMO.forEach(desbloquear);

    desbloquear("calculo-financiero");
    desbloquear("gestion-talento");

    OPTATIVAS.forEach(desbloquear);
  }

  Object.entries(correlativas).forEach(([materia, requisitos]) => {

    let cumple = true;

    requisitos.forEach(req => {

      if (req === "PRIMER") {

        if (!primerTramoCompleto()) {
          cumple = false;
        }

      } else {

        if (!materiaAprobada(req)) {
          cumple = false;
        }

      }

    });

    if (cumple) {
      desbloquear(materia);
    }

  });

  const aprobadas =
    document.querySelectorAll(".aprobada").length;

  const restantes = TOTAL_MATERIAS - aprobadas;

  if (restantes <= 5) {
    desbloquear("practica");
  }

  guardar();
}

function actualizarProgreso() {

  const aprobadas =
    document.querySelectorAll(".aprobada").length;

  const porcentaje =
    Math.round((aprobadas / TOTAL_MATERIAS) * 100);

  barra.style.width = porcentaje + "%";

  texto.textContent =
    `${aprobadas} de ${TOTAL_MATERIAS} materias aprobadas (${porcentaje}%)`;
}

materias.forEach(materia => {

  const id = materia.dataset.id;

  if (estados[id]) {
    materia.classList.remove(
      "bloqueada",
      "habilitada",
      "cursando",
      "aprobada"
    );

    materia.classList.add(estados[id]);
  }

  materia.addEventListener("click", () => {

    if (materia.classList.contains("bloqueada")) {
      return;
    }

    if (materia.classList.contains("habilitada")) {

      materia.classList.remove("habilitada");
      materia.classList.add("cursando");

    } else if (materia.classList.contains("cursando")) {

      materia.classList.remove("cursando");
      materia.classList.add("aprobada");

    } else if (materia.classList.contains("aprobada")) {

      materia.classList.remove("aprobada");
      materia.classList.add("habilitada");

    }

    estados[id] = obtenerEstado(materia);

    actualizarCorrelativas();
    actualizarProgreso();

  });

});

botonReset.addEventListener("click", () => {

  const confirmar =
    confirm("¿Querés borrar todo tu progreso?");

  if (!confirmar) return;

  localStorage.removeItem("planAdministracion");
  location.reload();

});

actualizarCorrelativas();
actualizarProgreso();