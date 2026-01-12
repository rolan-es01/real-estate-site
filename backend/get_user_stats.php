<?php
include 'db_config.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);
$username = isset($_GET['user']) ? $_GET['user'] : '';

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'No user provided']);
    exit;
}

$query = "SELECT COUNT(*) as total FROM messages WHERE username = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

echo json_encode([
    'success' => true,
    'inquiry_count' => $data['total']
]);
?>