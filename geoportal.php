<?php
// Configuración para mostrar errores
ini_set('memory_limit', '256M');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Conexión al servidor de PostgreSQL
$connection = pg_connect("host=3.135.88.57 dbname=geoserver_db port=5432 user=postgres password=postgrescipaes");
if (!$connection) {
    die("No se ha podido establecer conexión con la base de datos.");
}

// Obtener el tipo del formulario (POST)
$tipo = isset($_POST['tipo']) ? $_POST['tipo'] : '';
$region = isset($_GET['region']) ? $_GET['region'] : '';

// Comenzar la consulta SQL
$query = "SELECT nombre, cat_manejo, estados, region, superficie, s_terres, s_marina, prim_dec, ST_AsGeoJson(geom,5) as coords FROM anp";

// Agregar filtros según el tipo y la región
$conditions = [];

if (!empty($tipo) && $tipo !== "nodata") {
    if ($tipo !== "TOT") {
        $conditions[] = "cat_manejo = '$tipo'";
    }
}

if (!empty($region)) {
    $conditions[] = "(region ILIKE '%$region%' OR estados ILIKE '%$region%')";
}

// Agrega las condiciones a la consulta
if (!empty($conditions)) {
    $query .= " WHERE " . implode(' AND ', $conditions);
}

$query .= " ORDER BY nombre";

// Ejecutar la consulta SQL
$result = pg_query($connection, $query);
if (!$result) {
    die("Error en la consulta: " . pg_last_error($connection));
}

// Crear un array para almacenar las características (features)
$features = [];
while ($row = pg_fetch_assoc($result)) {
    $geometry = json_decode($row['coords'], true);
    unset($row['coords']);
    $features[] = ["type" => "Feature", "geometry" => $geometry, "properties" => $row];
}

// Crear la colección de características (FeatureCollection)
$featureCollection = ["type" => "FeatureCollection", "features" => $features];

// Devolver el JSON
header('Content-Type: application/json');
echo json_encode($featureCollection);

// Cerrar la conexión
pg_close($connection);
?>
