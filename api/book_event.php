<?php

header("Content-Type: application/json");

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$user_id = intval($_POST["user_id"] ?? 0);
$event_id = intval($_POST["event_id"] ?? 0);

if ($user_id <= 0 || $event_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user or event."
    ]);
    exit;
}

/* Check if event exists */

$eventCheck = $conn->prepare(
    "SELECT id, capacity FROM events WHERE id = ?"
);

$eventCheck->bind_param("i", $event_id);
$eventCheck->execute();

$eventResult = $eventCheck->get_result();

if ($eventResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Event not found."
    ]);
    exit;
}

$event = $eventResult->fetch_assoc();

/* Check existing booking */

$bookingCheck = $conn->prepare(
    "SELECT id FROM bookings
     WHERE user_id = ? AND event_id = ?"
);

$bookingCheck->bind_param("ii", $user_id, $event_id);
$bookingCheck->execute();

$bookingResult = $bookingCheck->get_result();

if ($bookingResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "You have already booked this event."
    ]);
    exit;
}

/* Check capacity */

$countStmt = $conn->prepare(
    "SELECT COUNT(*) AS total
     FROM bookings
     WHERE event_id = ? AND status = 'confirmed'"
);

$countStmt->bind_param("i", $event_id);
$countStmt->execute();

$countResult = $countStmt->get_result();
$count = $countResult->fetch_assoc();

if ($count["total"] >= $event["capacity"]) {
    echo json_encode([
        "success" => false,
        "message" => "This event is fully booked."
    ]);
    exit;
}

/* Generate ticket number */

$ticketNumber = "SP-" . strtoupper(substr(uniqid(), -8));

$stmt = $conn->prepare(
    "INSERT INTO bookings
    (user_id, event_id, ticket_number, status)
    VALUES (?, ?, ?, 'confirmed')"
);

$stmt->bind_param(
    "iis",
    $user_id,
    $event_id,
    $ticketNumber
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Booking successful.",
        "ticket_number" => $ticketNumber,
        "booking_id" => $stmt->insert_id
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Booking failed."
    ]);
}

$stmt->close();
$eventCheck->close();
$bookingCheck->close();
$countStmt->close();
$conn->close();

?>