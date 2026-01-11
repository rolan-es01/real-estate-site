<?php
include 'db_config.php';
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['username']) && isset($data['property_title'])) {
    $query = "DELETE FROM messages WHERE username = ? AND property_title = ?"; 
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $data['username'], $data['property_title']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}
?>