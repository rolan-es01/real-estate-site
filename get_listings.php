<?php
header("Content-Type: application/json");

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "real_estate_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Select the data (including the new columns for beds, baths, and sqft)
$sql = "SELECT id, title, price, location, image_url, type, beds, baths, sqft FROM listings";
$result = $conn->query($sql);

$listings = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $listings[] = $row;
    }
}

// Send the data back to JavaScript as a JSON object
echo json_encode($listings);

$conn->close();
?>
