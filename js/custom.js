$(document).ready(function() {
  $('#guardarColeccion').click(function (e) {
    $("#modalGuardar").modal()
    e.preventDefault();
  })
  $('#cargarColeccion').click(function (e) {
    $("#modalCargar").modal()
    e.preventDefault();
  })
  // To use in your own application, replace this API key with your own.
      var apiKey = 'AIzaSyAOdqXBCyOZdkXkljknwq1Z-bdwQosMvHE';

      // Use a button to handle authentication the first time.
      function handleClientLoad() {
        gapi.client.setApiKey(apiKey);
      }

  // Open Street Map init
  var colecciones = [];
  var alojados = [];
  var nombrecoleccion;
  var nombreparking;
  var mymap = L.map('mapid').setView([40.41637, -3.70274], 12);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);

  $("#parking").click(function(e) {
    document.getElementById("parking-list").style.height = "460px";
    $("#mapid").removeClass("hidden");
    $("#coleccioneslista").addClass("hidden");
    $("#parkingcoleccionlista").removeClass("hidden");
    $("#guestlist").addClass("hidden");
    $("#addguser").addClass("hidden");
    e.preventDefault();
  });

  $("#colecciones").click(function(e) {
    document.getElementById("parking-list").style.height = "460px";
    $("#mapid").addClass("hidden");
    $("#coleccioneslista").removeClass("hidden");
    $("#parkingcoleccionlista").removeClass("hidden");
    $("#guestlist").addClass("hidden");
    $("#addguser").addClass("hidden");
    $("#parkinfo").addClass("hidden");
    e.preventDefault();
  });

  $("#instalaciones").click(function(e) {
    $("#mapid").addClass("hidden");
    $("#coleccioneslista").addClass("hidden");
    $("#parkingcoleccionlista").addClass("hidden");
    $("#guestlist").removeClass("hidden");
    $("#addguser").removeClass("hidden");
    $("#parkinfo").removeClass("hidden");
    document.getElementById("parking-list").style.height = "256px";
    e.preventDefault();
  });

        // Load the API and make an API call.  Display the results on the screen.
        function makeApiCall(guestid) {
          gapi.client.setApiKey(apiKey);
          gapi.client.load('plus', 'v1', function() { // servicio, version , funcion callBack
            var request = gapi.client.plus.people.get({ // mira en el explorador con los parametros que nos interesen
              'userId': guestid // yo : 109371503170659888669 -- Mirando mi perfil de Google+
            });
          request.execute(function(resp) {
            console.log(resp);
            console.log(nombreparking);
            if (resp.displayName == undefined) {
              alert("Usuario no encontrado")
              return;
            }
            if (nombreparking in alojados) {
              console.log("Coleccion creada");
            } else {
              alojados[nombreparking] = [];
            }
            usuario = new Array();
            usuario["nombre"] = resp.displayName;
            usuario["imagen"] = resp.image.url;
            alojados[nombreparking].push(usuario);
            $("#guestlistbody").append("<a href='#' class='list-group-item'>" + "<img class='img-circle' src='" + usuario.imagen + "'>" + usuario.nombre + "</a>");
          });
        });
      }

  // Conexion con el servidor WebSocket
  $("#newguest").click(function(e) {
    var userid =[];
    var output = document.getElementById("output");
    try {
          i = 0;
          var host = "ws://localhost:1234/";
          var s = new WebSocket(host);

          s.onopen = function (e) {
            console.log("Socket opened.");
          };

          s.onclose = function (e) {
            console.log("Socket closed.");
          };
          s.onmessage = function (e) { // lo que recibo del server
        		console.log("Socket message:", e.data);

            if(userid.includes(e.data)){
              if(userid.length==7){
                s.close();
              }
              return;
            }
            userid.push(e.data);
            var content='<button class="btn-user" type="submit" data-id="'+userid[i]+'">'+userid[i]+'</buton>';
            $("#output").append(content);
            i++;
          };

          s.onerror = function (e) {
            console.log("Socket error:", e);
          };

        } catch (ex) {
          console.log("Socket exception:", ex);
        }
  });

  $(document).on("click",".btn-user",function(){
    var guestid =$(this).data('id');
    makeApiCall(guestid);

  });

  // Github
    // guardar
  $(document).on("click","#guardarForm",function(e){
        token = $("#tokenGithubDestino").val();
        repositorio = $("#repositorioDestino").val();
        ficheroColeccion =$("#nombreFicheroDestino").val();
        //ficheroGusers = "g_" + $("#nombreFicheroDestino").val();
        if(token=="" || repositorio=="" || ficheroColeccion==""){
        		alert("Completa todos los campos");
        		return;
        }
        var github = new Github({token:token,auth:"oauth"});
        var Gtcolecciones = $("#listacolecciones a");
        var array = new Array();
        arrayPark = [];
        arrayuser = [];
        for (x = 0; x < Gtcolecciones.length ;x++){
          for (i=0; i < colecciones[Gtcolecciones[x].id].length;i++){
            park = colecciones[Gtcolecciones[x].id][i].nombre;
            arrayPark.push(park);
            if(alojados[colecciones[Gtcolecciones[x].id][i]["nombre"]] != null){

              for (var u = 0; u < alojados[colecciones[Gtcolecciones[x].id][i]["nombre"]].length; u++) {
                  var usu ={
                    nombre : alojados[colecciones[Gtcolecciones[x].id][i]["nombre"]][u].nombre,
                    imagen : alojados[colecciones[Gtcolecciones[x].id][i]["nombre"]][u].imagen
                  }
                arrayuser.push(usu);
              }
            }

            var aparcamientos ={
              parking : arrayPark,
              usuarios : arrayuser
            }
          }
          var coleccTotal={
            id:Gtcolecciones[x].id,
            parkings : aparcamientos
          }
          array.push(coleccTotal);
      }
        var guardar={
        colec : array,
      }

        var JSONColeccion = JSON.stringify(guardar, null, 2);
        gitRepositorio = github.getRepo("crisgh", repositorio);
        gitRepositorio.write("master", ficheroColeccion+".json", JSONColeccion, "file", function(err){});

        alert("Guardado con éxito");
        $("#modalGuardar").modal('toggle');
        e.preventDefault();
      });

      //cargar
      $(document).on("click","#cargarForm",function(){
        token = $("#tokenGithubOrigen").val();
        repositorio = $("#repositorioOrigen").val();
        ficheroColeccion =$("#nombreFichero").val();
        var github = new Github({token:token,auth:"oauth"});
        gitRepositorio = github.getRepo("crisgh", repositorio);
        gitRepositorio.read('master',ficheroColeccion, function(e, data) {
	         ficheroDireccion = "https://api.github.com/repos/crisgh/" + repositorio + "/contents/" + ficheroColeccion;
           $.getJSON(ficheroDireccion, function(data) {
             console.log(data);
           });
        alert("Cargado con éxito");
        $("#modalCargar").modal('toggle');
        e.preventDefault();
      });
    });

  // json get parking-list
  $("#json").click(function(){
    $.getJSON("instalaciones.json", function(data) {
      var list = '<div class="list-group parking-list">';
      datos = data["@graph"];
      console.log(datos);
      for (var i = 0; i < datos.length; i++) {
        list = list + '<a href="#" id="' + datos[i].id + '" class="list-group-item">' + datos[i].title + '</a>'
      }
      list = list + '</div>'

      document.getElementById("parking-list").style.height = "460px";
      $("#parking-list").html(list);
      $("#parking").removeClass("disabled");
      $("#colecciones").removeClass("disabled");
      $("#instalaciones").removeClass("disabled");
      $("#parkingcoleccionlista").removeClass("hidden");

      $("#parking-list a").draggable({revert: true, helper: "clone", opacity: 0.5, revertDuration: 100});
      $("#parkingcoleccionlista").droppable({
        drop: handleDropEvent
      });

      function handleDropEvent(event,ui) {
        parking = new Array();
        parking["id"] = ui.draggable.attr('id');
        parking["nombre"] = ui.draggable.text();
        if (nombrecoleccion == "") {
          return;
        }
        colecciones[nombrecoleccion].push(parking);
        $("#parkingcoleccionbody").append('<a href="#" class="list-group-item">' + ui.draggable.text() + '</a>');
      }
    });
  });

  $("#nuevacoleccion").submit(function(e) {
    nombrecoleccion = $("#nombreNuevaColeccion").val();
    if (nombrecoleccion == "") {
      return;
    }
    if (nombrecoleccion in colecciones) {
      alert("Colección ya existente, intentalo con otro nombre.");
      return;
    }
    colecciones[nombrecoleccion] = [];
    var coleccion = "<a href='#' id='" + nombrecoleccion +
                    "'class='list-group-item'>" + nombrecoleccion +
                    "</a>";
    colecciones.push(coleccion);
    $("#coleccioneslista .panel-body .list-group").append(coleccion);
    $( "input.first" ).val("");
    e.preventDefault();
  });

  $("#listacolecciones").on("click", "a", function(e) {
    nombrecoleccion = this.id;
    $("#listacolecciones>a.active").removeClass("active");
    $("#"+this.id).addClass("active");
    html = '<div class="list-group">';
    parkingaux = colecciones[this.id];
    for (var i = 0; i < parkingaux.length; i++) {
      html += "<a href='#' class='list-group-item'>" + parkingaux[i]["nombre"] + "</a>";
    }
    html += '</div>';
    $("#nombreColec").html('Colección seleccionada &#10511;<b><em> ' + nombrecoleccion + ' </em></b>&#10510;');
    $("#parkingcoleccionbody").html(html);
  });

  // list click function for showing info
  var marker;
  $("#parking-list").on("click", "a", function() {
    $("#guestlistbody").html(" ");

    for (var i = 0; i < datos.length; i++) {
      if (datos[i].id == (this.id)) {
        var lng = datos[i].location.longitude;
        var lat = datos[i].location.latitude;
        var nmb = datos[i].title;
        var bdy = datos[i].organization;
        var adr = datos[i].address;

        bdy = bdy["organization-desc"];
        zip = adr["postal-code"];
        strt = adr["street-address"];
        var local = adr["locality"];
        nombreparking = nmb;
        if (nmb in alojados) {
          html = '';
          for (var i = 0; i < alojados[nombreparking].length; i++) {
              html += "<a href='#' class='list-group-item'>" + "<img class='img-circle' src='" + alojados[nombreparking][i].imagen + "'>" + alojados[nombreparking][i].nombre + "</a>";
          }
        $("#guestlistbody").html(html);
        }
      }
    }

            mymap.setView([lat, lng], 15);
            // function for closing markers and popups pressing

            marker = L.marker([lat,lng]).addTo(mymap).bindPopup('<b>'
                  + nmb + '</b><br>' +
                  strt).openPopup();
          // aprovechamos la llamada de popupclose para quitar el marker
          marker.on("popupclose", function() {
          mymap.removeLayer(marker);
        });
       $("#parkinfo").removeClass("hidden");
       $("#parkingname").html(nombreparking);
       $("#descripcion").html(bdy);
       $("#direccion").html(strt + ", " + zip +
                             "<br> (" + local +")");


      var urlFotos = "https://commons.wikimedia.org/w/api.php?format=json&action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggslimit=5&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=100px&iiurlheight=80px&callback=?";
      $.getJSON(urlFotos, {
          ggscoord : lat+"|" + lng,
          dataType : "jsonp"
         }).done(function(data) {

           var html;
         html = "<div id='myCarousel' class='carousel slide' data-ride='carousel'>" +
          "<div class='carousel-inner' role='listbox'>";

          $.each(data.query, function(i,item) {
            nim = 0;
            for( a in item){
              urlimage = item.valueOf(a)[a].imageinfo[0].url;
              urlimag = urlimage.slice();

              if (nim==0) {
                console.log("en 0");
                html += "<div class='item active'><img class='img-responsive' src=" + urlimag + "></div>";
              } else {
                console.log("en ELSE")
                html += "<div class='item'><img class='img-responsive' src=" + urlimag + "></div>";
              }
              nim++;
            }

      html += "</div><a class='left carousel-control' href='#myCarousel role='button' data-slide='prev'>" +
            "<span class='glyphicon glyphicon-chevron-left' aria-hidden='true'></span>" +
            "<span class='sr-only'>Previous</span></a>" +
            "<a class='right carousel-control' href='#myCarousel' role='button' data-slide='next'> " +
            "<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span>" +
            "<span class='sr-only'>Next</span></a></div>";
            $("#carouselhtml").html(html);
          });
        });
  });
});
