<?php
include 'db_config.php'; // Reuse your working connection

// Fetch all messages from the database
$sql = "SELECT id, username, property_title, message_text, created_at FROM messages ORDER BY created_at DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin - User Inquiries</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
        table { width: 100%; border-collapse: collapse; background: #fff; }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #ff8c00; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .no-msg { padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <h2>User Inquiries Dashboard</h2>
    
    <?php if ($result->num_rows > 0): ?>
        <table>
         <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Property</th>
            <th>Message</th>
            <th>Date</th>
            <th>Action</th> 
          </tr>
         </thead>
    <tbody>
       <?php while($row = $result->fetch_assoc()): ?>
           <tr>
            <td><?php echo $row['id']; ?></td>
            <td><?php echo htmlspecialchars($row['username']); ?></td>
            <td><?php echo htmlspecialchars($row['property_title']); ?></td>
            <td><?php echo nl2br(htmlspecialchars($row['message_text'])); ?></td>
            <td><?php echo $row['created_at']; ?></td>
            <td>
                <a href="delete_message.php?id=<?php echo $row['id']; ?>" 
                   onclick="return confirm('Are you sure you want to delete this?');" 
                   style="color: red; text-decoration: none; font-weight: bold;">
                   Delete
                </a>
            </td>
          </tr>
        <?php endwhile; ?>
     </tbody>

        </table>
    <?php else: ?>
        <p class="no-msg">No messages found in the database.</p>
    <?php endif; ?>

    <br>
    <a href="index.html">Back to Site</a>
</body>
</html>
