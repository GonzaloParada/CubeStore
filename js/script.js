/*--------------------------------------------------------------------------------
--------------------------------MENU----------------------------------------------
--------------------------------------------------------------------------------*/
let btnHamburguesa = document.querySelector(".nav__menu-desplegable");
let navHamburguesa = document.querySelector(".nav__ul");
let header = document.querySelector(".header");
let menuLinks = document.querySelectorAll(".menu-link")


btnHamburguesa.addEventListener("click", () => {
  navHamburguesa.classList.toggle("nav__ul--active");
})

window.addEventListener("scroll", (e) => {
  if (window.scrollY > 400) {
    header.style.backgroundColor = "rgb(35, 156, 226)";
    header.style.transition = ".5s";
    menuLinks.forEach(el => {
      el.classList.add("menu-link--scroll")

    });
  } else {
    header.style.backgroundColor = "transparent";
    menuLinks.forEach(el => {
      el.classList.remove("menu-link--scroll")

    });
  }
})

/*--------------------------------------------------------------------------------
----------------------------------CARDS-------------------------------------------
--------------------------------------------------------------------------------*/
let cardContenedor = document.querySelector(".productos__card-contenedor");

fetch("./js/productos.json")
  .then(res => res.json())
  .then(data => displayProductos(data));


function displayProductos(data) {
  let cardHTML = "";
  for (let producto of data) {
    cardHTML +=
      `
      <div class="card">
        <div class="card__div-img">
            <img src="${producto.imagen}" class="card__img" >
        </div>
        <h2 class="card__titulo">${producto.nombre}</h2>
        <p class="card__descripcion">cubo 3x3 candy colors</p>
        <div class="card__div-marca-precio">
          <p class="card__marca">QIYI</p>
          <p class="card__precio">${producto.precio} $</p>
        </div>
        <button class="card__btn btn-cuadrado">Agregar a carrito</button>
      </div>
        `;
  }
  cardContenedor.innerHTML = cardHTML;

  let botonesAgregar = document.querySelectorAll(".card__btn");

  botonesAgregar.forEach(boton => {
    boton.addEventListener("click", sumarCarrito);
  });
}


/*--------------------------------------------------------------------------------
----------------------------------CARRITO-----------------------------------------
--------------------------------------------------------------------------------*/
let carritoContenedor = document.querySelector(".carrito__productos-container");
let carrito = document.querySelector(".seccion-carrito")
let carritoIconoSalir = document.querySelector(".carrito__icono-salir");
let iconoCarrito = document.querySelector(".icono-carrito");
let carritoItems = document.querySelector(".carrito__items");
let pagoMonto = document.querySelector(".pago__monto");
let btnPago = document.querySelector(".carrito__btn-pago");

//entrar al carrito
iconoCarrito.addEventListener("click", () => {
  carrito.style.display = "flex";
})


//salir del carrito
carritoIconoSalir.addEventListener("click", () => {
  carrito.style.display = "none";
})

//mensaje de agregar al carrito
function tostifyMensaje(nombre) {
  Toastify({
    text: `${nombre} agregado al carrito!`,
    duration: 1500,
    gravity: "bottom"
  }).showToast();
}

//modal de pago
btnPago.addEventListener("click", funcionPagar)

function funcionPagar(){
  if(carritoContenedor.children.length < 1){
    Swal.fire({
      title: 'No hay items en el carrito!',
      color: "rgb(35, 156, 226)",
      confirmButtonColor: "rgb(255, 175, 25)"
    })
  }
  else {
    Swal.fire({
      title: '¿Está seguro de que desea hacer la compra?',
      text: `Desea adquir esta compra por ${pagoMonto.textContent} $`,
      icon: 'question',
      iconColor: "rgb(255, 54, 4)",
      color: "rgb(35, 156, 226)",
      showCancelButton: true,
      confirmButtonColor: "rgb(35, 156, 226)",
      cancelButtonColor: "rgb(255, 54, 4)",
      confirmButtonText: 'Sí, seguro',
      cancelButtonText: 'No, no quiero'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Compra realizada con exito!',
          icon: 'success',
          color: "rgb(35, 156, 226)",
          confirmButtonColor: "rgb(255, 175, 25)"
        })
        carritoContenedor.innerHTML = "";
        totalPrecio ();
        sumarCantidadItems();
      }
    })
  }
}

function sumarCarrito(e) {
  let botonHTML = e.target;
  let cardHTML = botonHTML.closest(".card");
  let imagen = cardHTML.querySelector(".card__img").src;
  let nombre = cardHTML.querySelector(".card__titulo").textContent;
  let precio = cardHTML.querySelector(".card__precio").textContent;

  if (sumarProductoRepetidoAlCarrito(nombre)) {
    tostifyMensaje(nombre);
    sumarCantidadItems();
    totalPrecio ()
    return;
  } else {
    tostifyMensaje(nombre);
    creaItemHTML(nombre, imagen, precio);
    sumarCantidadItems();
    totalPrecio ()
  }
}

//suma producto repetido y devuelve true si esta repetido
function sumarProductoRepetidoAlCarrito(nombre) {
  let nombreItemsEnCarritoHTML = carritoContenedor.querySelectorAll(".producto__nombre");
  for (let itemNombre of nombreItemsEnCarritoHTML) {
    if (itemNombre.textContent == nombre) {
      let productoHTML = itemNombre.closest(".producto");
      let cantidad = productoHTML.querySelector(".producto__cantidad");
      cantidad.innerHTML = parseInt(cantidad.innerHTML) + 1;
      return true;
    }
  };
}
//agrega al carrito producto nuevo
function creaItemHTML(nombre, imagen, precio) {
  let item = document.createElement("div");
  item.classList.add("producto");
  let itemCarritoHTML =
    `    
      <img src="${imagen}" alt="">
      <div class="producto__info">
          <h3 class="producto__nombre">${nombre}</h3>                    
          <p class="producto__precio">${precio} $</p>
          <div class="producto__cantidad-container">
              <div class="restar-items btn-circulo">-</div>
              <div class="producto__cantidad">1</div>
              <div class="sumar-items btn-circulo">+</div>
          </div>              
      </div>                    
      <div class="producto__btn-remove"><i class="fas fa-trash"></i></div>
    `;
  item.innerHTML = itemCarritoHTML;
  carritoContenedor.append(item);

  //agregamos funcion de borrar
  let botonesRemover = document.querySelectorAll(".producto__btn-remove")
  botonesRemover.forEach(btn => {
    btn.addEventListener("click", borrarItemCarrito)
  });

  //agregamos funcion sumar y restar item
  let btnRestar = document.querySelectorAll(".restar-items");
  let btnSumar = document.querySelectorAll(".sumar-items");
  btnRestar.forEach(btn => {
    btn.addEventListener("click", disminuirCantidadItem) 
  });

  btnSumar.forEach(btn => {
    btn.addEventListener("click", aumentarCantidadItem)
  });
}

function borrarItemCarrito(e) {
  let botonHTML = e.target;
  let removerHTML = botonHTML.closest(".producto");
  carritoContenedor.removeChild(removerHTML);
  sumarCantidadItems();
  totalPrecio ()
}

//disminuir la cantidad de item
function disminuirCantidadItem(e){
  let producto = e.target.closest(".producto");
  let cantidad = producto.querySelector(".producto__cantidad");
  if(cantidad.innerHTML <= 1 ){
    return;
  }
  else{
    let cantidadDisminuida = parseInt(cantidad.innerHTML) - 1;
    cantidad.innerHTML = cantidadDisminuida;
    sumarCantidadItems();
    totalPrecio ()
  }
}

//aumentar la cantidad de item
function aumentarCantidadItem(e){
  let producto = e.target.closest(".producto");
  let cantidad = producto.querySelector(".producto__cantidad");
  let cantidadAumentada = parseInt(cantidad.innerHTML) + 1;
  cantidad.innerHTML = cantidadAumentada;
  sumarCantidadItems();
  totalPrecio ()
}

//sumar items
function sumarCantidadItems (){
  let productosCantidades = document.querySelectorAll(".producto__cantidad");
  let sumaCantidad = 0;
  for(let cantidad of productosCantidades){
    sumaCantidad += parseInt(cantidad.innerHTML);
  }
  carritoItems.innerHTML = `${sumaCantidad} items`;
}

//total
function totalPrecio (){
  let productos = document.querySelectorAll(".producto");
  let total = 0;
  for(let producto of productos){
    let precio = parseInt(producto.querySelector(".producto__precio").innerHTML);
    let cantidad = parseInt(producto.querySelector(".producto__cantidad").innerHTML);
    total = total + (precio*cantidad);
  }
  pagoMonto.innerHTML = total;
}



    