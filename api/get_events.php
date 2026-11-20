<?php

header("Content-Type: application/json");

require_once "../config/database.php";

$sql = "
    SELECT
        e.id,
        e.organizer_id,
        e.school_faculty,
        e.event_type,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.event_time,
        e.venue,
        e.capacity,
        u.name AS organizer_name
    FROM events e
    LEFT JOIN users u
        ON e.organizer_id = u.id
    ORDER BY e.event_date ASC, e.event_time ASC
";

$result = $conn->query($sql);

$events = [];

if ($result) {

    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }

}

echo json_encode([
    "success" => true,
    "events" => $events
]);

$conn->close();

?>