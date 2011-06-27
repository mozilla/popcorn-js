<?php

$callback = $_REQUEST['callback'];

if ( !$callback ) {

  $callback = explode( "?", end( explode( "/", $_SERVER['REQUEST_URI']) ) );
  $callback = $callback[0];

}

echo $callback . '({ "data": {"lang": "en", "length": 25} });';

?>