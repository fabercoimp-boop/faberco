/* Datos de la tienda. Para cambiar precios, textos o stock, editá solo este archivo.
   precio:   precio del link de Mercado Pago (cuotas sin interés). Sin precio no se muestra nada.
   precioTransferencia: precio pagando por transferencia.
   linkPago: link de pago de Mercado Pago de ese producto (https://mpago.la/...). Con link, el botón dice "Comprar con Mercado Pago".
   stock:  "hay" | "poco" | "proximamente"
   fotos:  cantidad de fotos que hay en img/<slug>/1.webp, 2.webp, ... (0 = todavía sin fotos)       */
window.FABERCO = {
  version: "5",                                // subir este numero cuando se cambian las fotos
  whatsapp: "5493794320850",
  ubicacion: "Corrientes, Argentina",
  /* Datos del vendedor (se muestran en el pie de página) */
  vendedor: {
    nombre: "Bernabe Beltran",
    condicion: "Monotributista",
    cuit: "23-47421343-9",
    email: "fabercoimp@gmail.com"
  },

  /* Envíos: gratis en la primera compra y en compras que superen este monto */
  envioGratisDesde: 200000,

  /* Reseñas: link de tu Google Forms (si queda vacío, el botón abre WhatsApp) */
  formResenas: "https://docs.google.com/forms/d/e/1FAIpQLSfs9mJjLbRH4J5a5B74VubrBUYWx3h70Pcf9Woli_HgHdaBxQ/viewform",

  /* Reseñas REALES de clientes (solo con su permiso). Ejemplo de cómo se carga una:
     { producto: "carro", nombre: "Nombre del cliente", estrellas: 5, texto: "Lo que dijo", fecha: "Octubre 2026" }
     producto: el slug del producto (carro, hidrolavadora, horno, aspiradora, fuente-agua, bebedero, contenedor)
               o "" para una reseña general de la tienda. */
  resenas: [],

  instagram: "fabercoimp",

  /* El precio de cada producto (precio) es el precio de lista, ya con el recargo de las cuotas.
     Pagando por transferencia se descuenta el porcentaje de abajo. */
  cuotas: 3,                                   // cuotas sin interés con Mercado Pago
  transferencia: {
    descuento: 10,                             // % de descuento pagando por transferencia
    titular: "Bernabe Beltran",                               // nombre del titular de la cuenta
    alias: "faberco.imp",                                 // alias para transferir
    cbu: "0000003100027699117871",                                   // CBU o CVU
    banco: "Mercado Pago"                                  // banco o billetera (opcional)
  },

  categorias: [
    { id: "hogar",    nombre: "Hogar" },
    { id: "mascotas", nombre: "Mascotas" },
    { id: "exterior", nombre: "Exterior y limpieza" }
  ],

  productos: [
    {
      slug: "carro",
      nombre: "Carro Plegable Playero Reforzado",
      categoria: "exterior",
      stock: "hay",
      precio: 127600,
      precioTransferencia: 114800,
      linkPago: "https://mpago.li/2hJWiJv",
      fotos: 5,
      corta: "Estructura metálica plegable en segundos, con ruedas grandes para arena y terreno irregular.",
      descripcion: "Estructura metálica plegable en segundos. Ruedas grandes para arena y terreno irregular, mango extensible. Ideal para playa, camping, mudanzas chicas o mandados.",
      specs: [
        ["Color", "Negro"],
        ["Capacidad de carga", "Hasta 100 kg"],
        ["Plegado", "Sí, compacto"],
        ["Uso recomendado", "Playa, camping, exteriores"]
      ]
    },
    {
      slug: "hidrolavadora",
      nombre: "Hidrolavadora Inalámbrica 48V Multiuso",
      categoria: "exterior",
      stock: "hay",
      precio: 102600,
      precioTransferencia: 92400,
      linkPago: "https://mpago.li/2Bq5P7Z",
      fotos: 5,
      video: { src: "video/hidrolavadora.mp4", poster: "video/hidrolavadora.jpg" },
      corta: "Hidrolavadora portátil a batería para lavar autos, patios y muebles de exterior sin tomacorriente.",
      descripcion: "Hidrolavadora portátil a batería, ideal para lavar autos, patios y muebles de exterior sin depender de un tomacorriente.",
      specs: [
        ["Batería", "48V Li-ion, extraíble"],
        ["Manguera", "Desmontable"],
        ["Incluye", "Cargador, boquilla con filtro y maletín de transporte"]
      ]
    },
    {
      slug: "horno",
      nombre: "Horno Eléctrico 3 en 1 con Cafetera",
      categoria: "hogar",
      stock: "hay",
      precio: 197600,
      precioTransferencia: 177800,
      linkPago: "https://mpago.li/1XXVUtj",
      fotos: 5,
      corta: "Horno, plancha y cafetera en un solo equipo, ideal para desayunos y espacios chicos.",
      descripcion: "Combo de horno eléctrico, plancha y cafetera en un solo equipo, ideal para desayunos y espacios chicos.",
      specs: [
        ["Capacidad", "16 L"],
        ["Voltaje", "220-240 V"],
        ["Color", "Negro"],
        ["Incluye", "Jarra de vidrio para café, bandeja y rejilla para horno"],
        ["Anafe superior", "Con tapa de vidrio"]
      ]
    },
    {
      slug: "aspiradora",
      nombre: "Aspiradora Vertical 2 en 1",
      categoria: "hogar",
      stock: "poco",
      precio: 102600,
      precioTransferencia: 92300,
      linkPago: "https://mpago.li/2gpfkMN",
      fotos: 2,
      corta: "Liviana, para piso. Quitando el mango extensible se convierte en aspiradora de mano.",
      descripcion: "Aspiradora liviana para piso, se convierte en aspiradora de mano quitando el mango extensible. Ideal para uso diario y rincones difíciles.",
      specs: [
        ["Potencia", "600 W"],
        ["Formato", "2 en 1: vertical y de mano"],
        ["Depósito", "Transparente y desmontable"],
        ["Filtro", "Lavable y reutilizable"],
        ["Alimentación", "Con cable y enchufe"]
      ]
    },
    {
      slug: "fuente-agua",
      nombre: "Fuente de Agua Automática para Mascotas",
      categoria: "mascotas",
      stock: "poco",
      precio: 54900,
      precioTransferencia: 49150,
      linkPago: "https://mpago.li/1BHp6bi",
      fotos: 2,
      video: { src: "video/fuente.mp4", poster: "video/fuente.jpg" },
      corta: "Bebedero con filtro que mantiene el agua en circulación para que tomen agua fresca todo el día.",
      descripcion: "Bebedero automático con filtro, mantiene el agua en circulación constante para que perros y gatos tomen agua fresca todo el día.",
      specs: [
        ["Capacidad", "120 ml"],
        ["Carga", "USB"],
        ["Filtro", "De carbón"],
        ["Material", "Policarbonato transparente"],
        ["Limpieza", "Desmontable"],
        ["Funcionamiento", "Silencioso"]
      ]
    },
    {
      slug: "bebedero",
      nombre: "Bebedero y Comedero Dispenser para Mascotas",
      categoria: "mascotas",
      stock: "hay",
      precio: 42900,
      precioTransferencia: 38600,
      linkPago: "https://mpago.li/25biSrh",
      fotos: 3,
      corta: "Estación con dispenser de agua y comida: perros y gatos abastecidos por más tiempo.",
      descripcion: "Estación de alimentación automática con dispenser de agua y comida, mantiene abastecidos a perros o gatos por más tiempo sin recargar seguido.",
      specs: [
        ["Agua", "Dispenser con recipiente recargable"],
        ["Comida", "Dispenser con visor"],
        ["Base", "Dos platos (agua y comida)"],
        ["Diseño", "Compacto"]
      ]
    },
    {
      slug: "contenedor",
      nombre: "Contenedor Hermético Plegable para Alimento",
      categoria: "mascotas",
      stock: "hay",
      precio: 69190,
      precioTransferencia: 62250,
      linkPago: "https://mpago.li/1ZbRDUK",
      fotos: 4,
      corta: "Guarda el alimento balanceado bien cerrado y se pliega para ahorrar espacio.",
      descripcion: "Contenedor para guardar alimento balanceado, hermético y plegable para ahorrar espacio cuando no se usa.",
      specs: [
        ["Cierre", "Hermético"],
        ["Traslado", "Con ruedas"],
        ["Incluye", "Pala medidora y vaso dosificador"],
        ["Formato", "Plegable, con tapa transparente"]
      ]
    }
  ]
};
