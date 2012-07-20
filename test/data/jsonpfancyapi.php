<?php

$callback = $_REQUEST['jsonpfancyapi'];

if ( !$callback ) {

  echo 'Invalid Parameter';

} else {
  echo $callback . '({ "data": {"lang": "en", "length": 25} });';
}



?>
