document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([23.6345, -102.5528], 5);

    var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var Stadia_StamenTerrainBackground = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    var capasBase = {
        "Mapa de Calles": osmLayer,
        "Relieve": Stadia_StamenTerrainBackground,
        "Gris": Stadia_AlidadeSmooth,
        "Satelite": Esri_WorldImagery
    };

    L.control.layers(capasBase).addTo(map);


    //PRUEBA CAPAS GEOSERVER
        
    // Agregar capa WMS de Geoserver
    var ANP_capa = L.tileLayer.wms('http://3.135.88.57:8080/geoserver/cite/wms', {
        layers: 'cite:Áreas Naturales Protegidas',
        format: 'image/png',
        transparent: true,
        attribution: 'Datos &copy; Geoserver'
        })

    // Escuchar cambios en el checkbox
        // Escuchar cambios en el checkbox
        var ANP_Checkbox = document.getElementById('ANP-checkbox');
        ANP_Checkbox.addEventListener('change', function() {
            if (this.checked) {
                map.addLayer(ANP_capa);
                document.getElementById('ANP').style.display = 'block';  // Mostrar leyenda
            } else {
                map.removeLayer(ANP_capa);
                document.getElementById('ANP').style.display = 'none';  // Ocultar leyenda
            }
        });


        // Inicializar la visibilidad basada en el estado del checkbox
        if (ANP_Checkbox.checked) {
            map.addLayer(ANP_capa);
            document.getElementById('ANP').style.display = 'block';
        } else {
            document.getElementById('ANP').style.display = 'none';
        }


    // FINAL PRUEBA CAPAS GEOSERVER

    
    // CONTROLES DE DIBUJO
    map.addControl(new L.Control.LinearMeasurement({
        unitSystem: 'metric',
        color: '#ff9900',
        type: 'line'
    }));

    var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            },
            draw: {
                polygon: true,
                polyline: true,
                rectangle: true,
                circle: true,
                marker: true
            }
        });
        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED, function (event) {
            var layer = event.layer;

            drawnItems.addLayer(layer);
        });



    function popUpInfo(features, layer) {
        if (features.properties && features.properties.nombre) {
            layer.bindPopup("<b>Nombre: " + features.properties.nombre + "</b><br/>Categoría de manejo: " + features.properties.cat_manejo + "<br/>Estados: " + features.properties.estados + "<br/>Región: " + features.properties.region);
        // Evento mouseover para cambiar estilo al pasar el cursor
/*         layer.on('mouseover', function(e) {
            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });
        });
        
        // Evento mouseout para restaurar el estilo original al salir del cursor
        layer.on('mouseout', function(e) {
            miconsulta.resetStyle(e.target);
        }); */

                // Añadir evento click para cambiar el estilo
                let selected = false;  // Variable para almacenar el estado de selección
        
                layer.on('click', function(e) {
                    selected = !selected;  // Alternar el estado de selección
        
                    if (selected) {
                        // Estilo cuando se selecciona la capa
                        layer.setStyle({
                            weight: 1,
                            color: '#ccb700',
                            dashArray: '',
                            fillOpacity: 0.7
                        });
                    } else {
                        // Restablecer el estilo original cuando se deselecciona
                        miconsulta.resetStyle(e.target);
                    }
                });
    }
}    

    var miconsulta = L.geoJson(null, {
        style: function (feature) {
            var optColorear = '';
            var columna = '';
            if (typeof(feature.properties.cat_manejo) !== 'undefined') {
                optColorear = feature.properties.cat_manejo;
                columna = 'cat_manejo';
            }
            return {
                stroke: true,
                color: getColour(optColorear, columna),
                opacity: 0.7,
                weight: 1
            };
        },
        onEachFeature: popUpInfo
    });

    function getColour(feature, campo) {
        switch (feature) {
            case 'RB':
                return "#027820";
            case 'APFF':
                return "#99ff33";
            case 'APRN':
                return "#ff9933";
            case 'PN':
                return "#6666FF";
            case 'MN':
                return "#33FFFF";
            case 'SANT':
                return "#CC33FF";
            default:
                return "#808080"; 
        }
    }

    $(document).ready(function() {
        $('#envio_post').on('submit', function(event) {
            event.preventDefault();
            var anpselected = $('#tipo').val();
    
            // Verificar el valor en la consola
            console.log('Valor seleccionado:', anpselected);
    
            // Verificar si la opción seleccionada es la predeterminada
            if (anpselected === null) {
                $('#contenido').html('No has seleccionado un tipo de ANP.');
                return false;
            }
    
            var URL = 'http://3.135.88.57/geoportal.php';
            var contenido_html = '';
    
            $.ajax({
                url: URL,
                type: 'POST',
                data: {
                    tipo: anpselected
                },
                success: function(respuesta) {
                    if (respuesta.features.length > 0) {
                        miconsulta.clearLayers();
                        miconsulta.addData(respuesta);
                        map.addLayer(miconsulta);
                        contenido_html = '';
                        for (var i = 0; i < respuesta.features.length; i++) {
                            contenido_html += "<b>Nombre de ANP:</b> " + respuesta.features[i].properties.nombre + "<br/>";
                            contenido_html += "<b>Tipo de ANP:</b> " + respuesta.features[i].properties.cat_manejo + "<br/>";
                            contenido_html += "<b>Superficie total (km<sup>2</sup>):</b> " + respuesta.features[i].properties.superficie + "<br/>";
                            contenido_html += "<b>Superficie terrestre (km<sup>2</sup>):</b> " + respuesta.features[i].properties.s_terres + "<br/>";
                            contenido_html += "<b>Superficie marina (km<sup>2</sup>):</b> " + respuesta.features[i].properties.s_marina + "<br/>";
                            contenido_html += "<b>Estados:</b> " + respuesta.features[i].properties.estados + "<br/>";
                            contenido_html += "<b>Región:</b> " + respuesta.features[i].properties.region + "<br/>";
                            contenido_html += "<b>Fecha de decreto:</b> " + respuesta.features[i].properties.prim_dec + "<br/>";
                            contenido_html += "<hr/>";
                        }
                    } else {
                        contenido_html = "La consulta no tiene resultados";
                    }
                    $('#contenido').html(contenido_html);
                },
                error: function(jqXHR, estado, error) {
                    $('#contenido').html('Se produjo un error: ' + estado + ' error: ' + error);
                }
            });
    
            return false;  // Previene el re-envío
        });
    });
    
    
    
    $('#envio_get').on('submit', function(event) {
        event.preventDefault();
        var region = $('#region').val();
        var URL = 'http://3.135.88.57/geoportal.php';
        var contenido_html = '';
    
        $.ajax({
            url: URL,
            type: 'GET',
            dataType: 'json',
            data: {
                region: region
            },
            success: function(data) {
                if (data && data.features && data.features.length > 0) {
                    var respuesta = data;
                    miconsulta.clearLayers();
                    miconsulta.addData(respuesta);
                    map.addLayer(miconsulta);
                    contenido_html = '';
                    for (var i = 0; i < respuesta.features.length; i++) {
                        contenido_html += "<b>Nombre de ANP:</b> " + respuesta.features[i].properties.nombre + "<br/>";
                        contenido_html += "<b>Tipo de ANP:</b> " + respuesta.features[i].properties.cat_manejo + "<br/>";
                        contenido_html += "<b>Superficie total (km<sup>2</sup>):</b> " + respuesta.features[i].properties.superficie + "<br/>";
                        contenido_html += "<b>Superficie terrestre (km<sup>2</sup>):</b> " + respuesta.features[i].properties.s_terres + "<br/>";
                        contenido_html += "<b>Superficie marina (km<sup>2</sup>):</b> " + respuesta.features[i].properties.s_marina + "<br/>";
                        contenido_html += "<b>Estados:</b> " + respuesta.features[i].properties.estados + "<br/>";
                        contenido_html += "<b>Región:</b> " + respuesta.features[i].properties.region + "<br/>";
                        contenido_html += "<b>Fecha de decreto:</b> " + respuesta.features[i].properties.prim_dec + "<br/>";
                        contenido_html += "<hr/>";
                    }
                } else {
                    miconsulta.clearLayers();
                    contenido_html = 'No existen áreas naturales protegidas bajo esta región';
                }
                $('#contenido').html(contenido_html);
            },
            error: function(xhr, status, error) {
                console.error("Error en la consulta AJAX: ", status, error);
                $('#contenido').html('Ocurrió un error al realizar la consulta.');
            }
        });
    });
    });    


// CONTROL PARA MODAL

document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("modalAcercaDe");
    var btn = document.querySelector('nav ul li a[data-toggle="modal"]');
    var span = document.getElementsByClassName("close")[0];

    if (btn) {
        btn.onclick = function() {
            modal.style.display = "block";
        }
    }

    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

});