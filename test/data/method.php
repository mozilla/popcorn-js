<?php
header("Content-type: application/json");
echo json_encode(
  array(
    "method" => sizeOf($_POST) ? "post" : "get"
  )
);
?>
