<?php

header("Content-Type: application/json");

require_once "../config/database.php";

$user_id = intval($_GET["user_id"] ?? 0);

if ($user_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user ID."
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT
        b.id,
        b.ticket_number,
        b.booking_date,
        b.status,
        e.id AS event_id,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.event_time,
        e.venue
    FROM bookings b
    INNER JOIN events e
        ON b.event_id = e.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
");

$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

$bookings = [];

while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode([
    "success" => true,
    "bookings" => $bookings
]);

$stmt->close();
$conn->close();

?>