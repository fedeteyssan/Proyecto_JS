
/*Clases constructoras de los objetos usuario y carrito */
class Usuario{
    constructor(pId, pNombre, pEmail, pDireccion){
        this.id = pId;
        this.nombre = pNombre;
        this.email = pEmail;
        this.direccion = pDireccion;
    }
}

class Carrito{
    constructor(pId){
        this.id = pId;
        this.productos = [];
    }

    calcularPrecioTotal(){
        precioTotal=0;
        for(let i = 0; i < this.productos.length; i++){
            precioTotal += this.productos[i][0] * this.productos[i][1].precio;
        }
    }
}

/*Defino la variable global para el precio total*/  
let precioTotal = 0;

/*Defino array catálogo y lo cargo mediante AJAX */ 

let catalogo = [];

const URLJSON = "productos.json";
$.getJSON(URLJSON, function (respuesta, estado) {
    if(estado === "success"){
      let datosProductos = respuesta;
      for (const dato of datosProductos)  {
        catalogo.push(dato)
      }  
    }
});


/*Método ready() de jQuery se emplea para detectar que el DOM está listo para usarse*/
$( document ).ready(function() {});

/*Defino un objeto carritoActual con sus ID*/  

let carritoActual = new Carrito(1);
let contador=0;

/*Evento de los botones "agregar al carrito", invocando la función de cargar */
$(".btn-agregar").click(function(){

    /*Tomo la cantidad del input y la guardo en un contador para mostrarlo en el carrito, luego lo guardo en el storage para trasladarlo de página */
    let quantity = $(this).parent().children(".input-cant").val();
    contador+= parseInt(quantity);
    $("#cart-count").text(contador).animate({ backgroundColor: "green",color:"white" }).animate({ backgroundColor: "#ffb11f", color:"black"});
   

    /*Cargo el carrito: busco el título de la imagen del produto que se agregó, que coincida con el nombre de un producto en el array catálogo */
    const itemName = $(this).parent().parent().children().children("img")[0].title;
    const item = catalogo.find(element => element.nombre == itemName);
    cargarCarrito(quantity,item);
    guardarPedido("pedidoGuardado", JSON.stringify(carritoActual));
    carritoActual.calcularPrecioTotal();

    /*Reseteo el valor de los inputs a 0*/
    let inputs = $(".input-cant");
    for(i=0;i<inputs.length;i++){inputs[i].value=0}
})

/*Llamo a la cantidad guardada para mostrarse en el carrito siempre */
$("#cart-count").text(sessionStorage.getItem("Unidades"));

/*Función para cargar el carrito con los productos (en cada posición del array voy a tener un array que contiene una cantidad 
y un producto seleccionado), incluye el llamado a la función de guardado del carrito con formato JSON*/
const cargarCarrito = (quantity,item) => {
    if(quantity>0){
        for(let i = 0; i<carritoActual.productos.length; i++){
            if(item == carritoActual.productos[i][1]){
                carritoActual.productos[i][0]= parseInt(carritoActual.productos[i][0])+parseInt(quantity);
		        return null;
	  	    }
        }
        carritoActual.productos.push([quantity,item]);
    }
}

/*Función para guardar un carrito en el session storage*/
const guardarPedido = (clave, valor) => {
    sessionStorage.setItem(clave, valor);
}

/*Evento al hacer click en el carrito */
$("#carrito").click(() => mostrarPedido(carritoActual));

/*Función para mostrar el pedido del carrito, calculando el precio y guardándolo en JSON */
const mostrarPedido = (cart)=> {
    
    /*Modifico el DOM mediante JS para crear un div resumen con un h3, al que le agrego otro div con el pedido y un b con su valor*/
    $("#resumen").empty().append(`<h3 class="text-center">Tu pedido es: </h3>`);

    for (const [quantity,items] of cart.productos){
        $("#resumen").append(`<div class="items-carrito"> <img src= ${items.imagen} class="thumbnail"> </img> <p class="linea-producto"> ${items.nombre} </p> <p>Cantidad: ${quantity}</p> <p>Precio: $ ${items.precio*quantity}</p> <button class="btn btn-danger">X</button> </div>`);
    }

    $("#resumen").append(`<div class="text-center"><b> Valor total a pagar: $ ${precioTotal} </b><br><br><div class="d-flex justify-content-evenly"><button  class="btn btn-secondary">Agregar más productos</button> <a id="continuar" class="btn btn-primary" href="formDatos.html" role="button">Continuar</a></div></div>`);

    /*Evento en botones "eliminar" producto del carrito (invoca a funciones para recalcular precio y guardar el carrito modificado*/	
    $(".btn-danger").click(function(){
        let item =$(this).parent().children(".linea-producto")[0].innerText;
        let cantEliminada=0;

        for(i=0;i<cart.productos.length;i++){
            if(cart.productos[i][1].nombre==item){
                cantEliminada=cart.productos[i][0];	
                cart.productos.splice(i,1);	
            }
        }
        /*Elimino el producto del renderizado y resto la cantidad que muestra el carrito */
        $(this).parent().remove();
        contador=contador-cantEliminada;
        $("#cart-count").text(contador).animate({ backgroundColor: "red",color:"white" }).animate({ backgroundColor: "#ffb11f", color:"black"});

        
        guardarPedido("pedidoGuardado", JSON.stringify(cart));
        cart.calcularPrecioTotal(); 
        
            
        $("b").text(`Valor total a pagar: $ ${precioTotal}`);
    }); 

    
    
    /*Animación para centrar y mostrar/ocultar el pedido al hacer click en el botón*/
    $("#resumen").slideToggle();   
        
    /*Animación para cerrar el pedido al querer cambiar la cantidad de algún producto*/
    $("input").click(function(){$("#resumen").hide()});
        
    /*Animación para cerrar el pedido al tocar boton "agregar más productos"*/
    $(".btn-secondary").click(function(){$("#resumen").hide()});   
}

/*Evento para cerrar el menu automáticamente en mobile*/
$('.navbar-nav>li>a').click(function(){
    $('.navbar-collapse').collapse('hide');
});

let pedidoActual={};

/*Al cargar la página con el formulario, se accede al pedidoGuardado y se lo transforma de nuevo a objeto"*/
$("formDatos.html").ready(function(){
    pedidoActual=JSON.parse(sessionStorage.getItem("pedidoGuardado"));
    for (const [quantity,items] of pedidoActual.productos){
        $("#pedido").append(`<li class="items-carrito"> <img src= ${items.imagen} class="thumbnail"> </img> <p class="linea-producto"> ${items.nombre} </p> <p>Cantidad: ${quantity}</p> <p>Precio: $ ${items.precio*quantity}</p>  </li>`);
        precioTotal += items.precio*quantity;
    }
    $("#total").text(`${precioTotal}`)
});

/*Evento en boton proceder al pago, se crea el objeto usuario y se añade al carrito, y se despliega el formulario de pago*/
$("form").first().submit(function(e) {
    e.preventDefault();
    pNombre=$("#inputName").val();
    pEmail=$("#inputEmail").val();
    pDireccion=$("#inputStreet").val()+" "+$("#inputNumber").val()+" "+$("#inputFloor").val()+", "
    +$("#inputCity").val()+", "+$("#inputState").val()+" ("+$("#inputZip").val()+")";
    
    pedidoActual.usuario= new Usuario(1,pNombre,pEmail,pDireccion);
    guardarPedido("pedidoGuardado", JSON.stringify(pedidoActual));
    
    $(".checkout").show();
});

/*Evento en botón finalizar compra*/
$(".checkout").submit(function(){
    alert(`${pedidoActual.usuario.nombre} tu pedido ha sido confirmado, a recibir en ${pedidoActual.usuario.direccion}. Te enviamos el resumen y la factura a ${pedidoActual.usuario.email}, muchas gracias y que lo disfrutes!`)
});

/*Evento para limitar caracteres numéricos*/
$(".inputNumero").on('keypress', function (e) {
	var code = e.which ? e.which : e.keyCode;
	if ((code !== 46 && code > 31 && (code < 48 || code > 57)) || (code === 46 && $(this).val().indexOf('.') > -1)) {
		e.preventDefault();
	}
});