<?php
header('Content-Type: application/json');
include 'db_config.php'; 

if(isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    // 1. Prepare the statement
    $stmt = $conn->prepare("SELECT * FROM listings WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    // 2. Get the result (The correct MySQLi way)
    $result = $stmt->get_result();
    $property = $result->fetch_assoc();

    if($property) {
        echo json_encode($property);
    } else {
        echo json_encode(['error' => 'Listing not found']);
    }
    
    $stmt->close();
}
?>