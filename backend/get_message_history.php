<?php
include 'db_config.php';
$username = isset($_GET['user']) ? $_GET['user'] : '';

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'No user provided']);
    exit;
}

// Fetch the house title and the date sent
$query = "SELECT property_title, created_at FROM messages WHERE username = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$history = [];
while ($row = $result->fetch_assoc()) {
    $history[] = $row;
}

echo json_encode(['success' => true, 'history' => $history]);
?>