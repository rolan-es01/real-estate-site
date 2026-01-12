<?php
include 'db_config.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'];
    $property = $_POST['property'];
    $msg = $_POST['message'];

    // Security check
    $user = mysqli_real_escape_string($conn, $user);
    $property = mysqli_real_escape_string($conn, $property);
    $msg = mysqli_real_escape_string($conn, $msg);

    // Make sure these column names match your DB table exactly!
    $sql = "INSERT INTO messages (username, property_title, message_text) 
            VALUES ('$user', '$property', '$msg')";

    if ($conn->query($sql) === TRUE) {
        echo "Success";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>
