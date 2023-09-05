document.addEventListener("DOMContentLoaded", () => {
  const { DateTime } = luxon;
  const fecha = document.querySelector("#fecha");
  const lista = document.querySelector("#lista");
  const realizadasLink = document.querySelector("#ver-tareas-realizadas");
  const realizadasLista = document.querySelector("#realizadas-lista");
  const pendientesLink = document.querySelector("#ver-tareas-pendientes");
  const input = document.querySelector("#input");
  const botonAgregar = document.querySelector("#boton-agregar");
  const tipoListaInput = document.querySelector("#tipo-lista");
  const fechaLimiteInput = document.querySelector("#fecha-limite");
  const categoriaInput = document.querySelector("#categoria");
  const personaInput = document.querySelector("#persona");
  const check = "fa-check-circle";
  const uncheck = "fa-circle";
  const lineThrough = "line-through";
  const botonCargarTareas = document.getElementById("cargar-tareas");
  let LIST = [];
  let LIST_REALIZADAS = [];
  let id = 0;
  let tareasPorPersona = {};




  // Creación de fecha actualizada
  const FECHA = new Date();
  fecha.innerHTML = FECHA.toLocaleDateString("es-MX", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).toUpperCase();

  // Función para agregar tarea
  function agregarTarea(
    tarea,
    categoria,
    persona,
    id,
    realizado,
    eliminado,
    fechaLimite,
    fechaRealizacion
  ) {
    if (eliminado) {
      return;
    }

    const REALIZADO = realizado ? check : uncheck;
    const LINE = realizado ? lineThrough : "";

    const fechaRealizacionTexto = fechaRealizacion
      ? luxon.DateTime.fromISO(fechaRealizacion).toFormat("dd-MM-yyyy HH:mm:ss")
      : "Pendiente de realización";

    const elemento = `
        <li id="elemento">
            <i class="far ${REALIZADO}" data="realizado" id="${id}"></i>
            <p class="text ${LINE}">${tarea} - Categoría: ${categoria} - Asignada a: ${persona}</p>
            ${
              fechaLimite
                ? `<span class="fecha-limite">Fecha Límite: ${fechaLimite}</span>`
                : ""
            }
            <span>${fechaRealizacionTexto}</span>
            <i class="fas fa-trash de" data="eliminado" id="${id}"></i>
        </li>
    `;

    lista.insertAdjacentHTML("beforeend", elemento);

    LIST.push({
      nombre: tarea,
      id: id,
      categoria: categoria,
      persona: persona,
      realizado: false,
      eliminado: false,
      fechaLimite: fechaLimite,
      fechaRealizacion: fechaRealizacion, // Actualizamos la fecha de realización aquí
    });
    localStorage.setItem("TODO", JSON.stringify(LIST));
  }

  // Función para cargar tareas pendientes
  function cargarTareasPendientes(listaTareasPendientes) {
    lista.innerHTML = "";
    listaTareasPendientes.forEach((item) => {
      if (!item.eliminado) {
        agregarTarea(
          item.nombre,
          item.categoria,
          item.persona,
          item.id,
          item.realizado,
          item.eliminado
        );
      }
    });
  }

  // Función para cargar tareas preestablecidas desde el archivo JSON
  function cargarTareasPreestablecidas() {
    fetch("tareas-preestablecidas.json")
      .then((response) => response.json())
      .then((data) => {
        LIST = data;
        cargarTareasPendientes(LIST);
      })
      .catch((error) => {
        console.error("Error al cargar tareas preestablecidas:", error);
      });
  }

  
 
  // Botón para cargar tareas preestablecidas
  const cargarTareasBtn = document.querySelector("#cargar-tareas");
  cargarTareasBtn.addEventListener("click", () => {
    cargarTareasPreestablecidas();
    cargarTareasBtn.disabled = true; // Deshabilitar el botón después de cargar las tareas
  });

  // Función para marcar tarea como realizada
  function tareaRealizada(element) {
    const id = element.id;
    LIST[id].realizado = !LIST[id].realizado;
    if (LIST[id].realizado) {
      LIST[id].fechaRealizacion = luxon.DateTime.local().toISO();
    } else {
      LIST[id].fechaRealizacion = null;
    }

    // Actualizar la lista visual
    const taskElement = element.parentNode;
    const textElement = taskElement.querySelector(".text");
    textElement.classList.toggle(lineThrough);

    // Agregar o remover el ícono de verificación
    element.classList.toggle(check);
    element.classList.toggle(uncheck);

    localStorage.setItem("TODO", JSON.stringify(LIST));
  }

  // Función para agregar tarea realizada
  function agregarTareaRealizada(tarea, categoria, persona, fechaHora) {
    const elemento = `
        <li>
            <p class="realizada">${tarea} - Categoría: ${categoria} - Asignada a: ${persona} - Realizado el: ${fechaHora}</p>
        </li>
    `;

    realizadasLista.insertAdjacentHTML("beforeend", elemento);

    localStorage.setItem("TODO", JSON.stringify(LIST));
  }
  ////funcion eliminar tarea////

  function tareaEliminada(element) {
    if (element) { // Verificar si element está definido
      const id = element.id;
  
      // Obtener el elemento de la lista
      const taskElement = element.closest("li");
  
      // Obtener la información de la tarea eliminada
      const tareaEliminada = LIST[id];
  
      // Eliminar el elemento de la lista visual
      lista.removeChild(taskElement);
  
      // Verificar si la tarea está definida
      if (tareaEliminada) {
        // Marcar la tarea como eliminada en el arreglo LIST
        tareaEliminada.eliminado = true;
  
        // Si la tarea estaba realizada, agregarla a la lista de tareas realizadas
        if (tareaEliminada.realizado) {
          const fechaHora = tareaEliminada.fechaLimite
            ? luxon.DateTime.fromISO(tareaEliminada.fechaLimite).toFormat(
                "dd-MM-yyyy HH:mm:ss"
              )
            : "Desconocida";
  
          // Agregar la tarea eliminada a la lista de tareas realizadas
          const tareaRealizada = {
            nombre: tareaEliminada.nombre,
            categoria: element.dataset.category,
            persona: tareaEliminada.persona,
            fechaRealizacion: luxon.DateTime.local().toISO(),
          };
          LIST_REALIZADAS.push(tareaRealizada);
          localStorage.setItem("TAREAS_REALIZADAS", JSON.stringify(LIST_REALIZADAS)); // Guardar la lista de tareas realizadas actualizada
  
          // Agregar el elemento a la lista visual de tareas realizadas
          const realizadoElemento = `
            <li>
              <p>Tarea: ${tareaRealizada.nombre}</p>
              <p>Categoría: ${tareaRealizada.categoria}</p>
              <p>Persona: ${tareaRealizada.persona}</p>
              <p>Fecha de realización: ${fechaHora}</p>
            </li>
          `;
          realizadasLista.insertAdjacentHTML("beforeend", realizadoElemento);
        }
      }
    }
  
  
  

   
  Swal.fire({
    title: 'Ya realizaste la tarea?',
    text: "mira que no se puede volver atras",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#af0560' ,
    confirmButtonText: 'Si ya la hice!!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Felicitaciones',
        'realizaste la tarea!!! ',
        
      )
    }
  })

    // Actualizar el almacenamiento local
    localStorage.setItem("TODO", JSON.stringify(LIST));
  }

  botonAgregar.addEventListener("click", () => {
    const tarea = input.value;
    const categoria = categoriaInput.value;
    const persona = personaInput.value;
    const tipoLista = tipoListaInput.value;
    const fechaLimite = tipoLista === "evento" ? fechaLimiteInput.value : null;

    if (tarea && categoria && persona) {
      agregarTarea(tarea, categoria, persona, id, false, false, fechaLimite);
      LIST.push({
        nombre: tarea,
        id: id,
        categoria: categoria,
        persona: persona,
        realizado: false,
        eliminado: false,
        fechaLimite: fechaLimite,
        fechaRealizacion: null,
      });

      if (!tareasPorPersona[persona]) {
        tareasPorPersona[persona] = [];
      }

      tareasPorPersona[persona].push({
        nombre: tarea,
        id: id,
        categoria: categoria,
        persona: persona,
        realizado: false,
        eliminado: false,
        fechaLimite: fechaLimite,
        fechaRealizacion: null,
      });

      localStorage.setItem("TODO", JSON.stringify(LIST));
      id++;
      input.value = "";
      categoriaInput.value = "";
      personaInput.value = "";
      fechaLimiteInput.value = "";

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Tu tarea ha sido agregada!',
        showConfirmButton: false,
        timer: 2000
      })

      
    }
  });
  lista.addEventListener("click", function (event) {
    const element = event.target;
    const elementData = element.attributes.data
      ? element.attributes.data.value
      : "";

    if (elementData === "realizado") {
      tareaRealizada(element);
      localStorage.setItem("TODO", JSON.stringify(LIST));
    } else if (elementData === "eliminado") {
      tareaEliminada(element);
      localStorage.setItem("TODO", JSON.stringify(LIST));
    }
  });

  tipoListaInput.addEventListener("change", () => {
    const tipoLista = tipoListaInput.value;
    if (tipoLista === "evento") {
      fechaLimiteInput.style.display = "block";
    } else {
      fechaLimiteInput.style.display = "none";
    }
  });

  fechaLimiteInput.addEventListener("change", () => {
    const fechaSeleccionada = DateTime.fromISO(
      fechaLimiteInput.value
    ).toLocaleString(DateTime.DATETIME_MED);
  });

  // Mostrar/ocultar fecha límite según el tipo de lista seleccionado
  tipoListaInput.addEventListener("change", () => {
    const tipoLista = tipoListaInput.value;
    fechaLimiteInput.style.display = tipoLista === "evento" ? "block" : "none";
  });


//boton agregar tareas predeterminadas//

  botonCargarTareas.addEventListener("mouseenter", () => {
    botonCargarTareas.style.transform = "scale(1.1)"; 
    botonCargarTareas.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)"; 
  });
  
  botonCargarTareas.addEventListener("mouseleave", () => {
    botonCargarTareas.style.transform = "scale(1)"; 
    botonCargarTareas.style.boxShadow = "none"; 
  });


  ////******tareas realizadas*****////////

  function cargarTareasRealizadas(array) {
    realizadasLista.innerHTML = "";

    array.forEach((item) => {
      const fechaRealizacionTexto = item.fechaRealizacion
        ? luxon.DateTime.fromISO(item.fechaRealizacion).toFormat(
            "dd-MM-yyyy HH:mm:ss"
          )
        : "Pendiente de realización";

      const elemento = document.createElement("li");
      elemento.innerHTML = `
            <p>Tarea: ${item.nombre}</p>
            <p>Categoría: ${item.categoria}</p>
            <p>Persona: ${item.persona}</p>
            <p>Fecha de realización: ${fechaRealizacionTexto}</p>
        `;

      realizadasLista.appendChild(elemento);
    });
  
  }
  // Agregar evento de clic para ver tareas realizadas
realizadasLink.addEventListener("click", () => {
  realizadasLista.style.display = "block";
  cargarTareasRealizadas(LIST_REALIZADAS);
});

// Agregar evento de clic para ocultar tareas realizadas
pendientesLink.addEventListener("click", () => {
  realizadasLista.style.display = "none";
});
  

  
  // Cargar tareas pendientes desde Local Storage
  const data = localStorage.getItem("TODO");
  if (data) {
    LIST = JSON.parse(data);
    cargarTareasPendientes(LIST);
  }

  // Cargar tareas realizadas desde localStorage
  const dataRealizadas = localStorage.getItem("TAREAS_REALIZADAS");
  if (dataRealizadas) {
    LIST_REALIZADAS = JSON.parse(dataRealizadas);

    cargarTareasRealizadas(LIST_REALIZADAS);
  }
});
