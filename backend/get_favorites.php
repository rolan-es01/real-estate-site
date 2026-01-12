<?php
include 'db_config.php';
$username = isset($_GET['user']) ? $_GET['user'] : '';

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'No user provided']);
    exit;
}

$query = "SELECT property_title, property_image FROM favorites WHERE username = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$favorites = [];
while ($row = $result->fetch_assoc()) {
    $favorites[] = $row;
}

echo json_encode(['success' => true, 'favorites' => $favorites]);
?>