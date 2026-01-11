<?php
include 'db_config.php';
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['username']) && isset($data['property_title'])) {
    $username = $data['username'];
    $house = $data['property_title'];
    $image = $data['property_image'];

    // Check if it's already a favorite
    $check = $conn->prepare("SELECT id FROM favorites WHERE username = ? AND property_title = ?");
    $check->bind_param("ss", $username, $house);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        // If it exists, "unfavorite" it (delete)
        $delete = $conn->prepare("DELETE FROM favorites WHERE username = ? AND property_title = ?");
        $delete->bind_param("ss", $username, $house);
        $delete->execute();
        echo json_encode(['success' => true, 'status' => 'removed']);
    } else {
        // Otherwise, add it
        $add = $conn->prepare("INSERT INTO favorites (username, property_title, property_image) VALUES (?, ?, ?)");
        $add->bind_param("sss", $username, $house, $image);
        $add->execute();
        echo json_encode(['success' => true, 'status' => 'added']);
    }
}
?>