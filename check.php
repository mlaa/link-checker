<?php

// Not particularly safe ... I wouldn't do this in my house!
$output = array(
  'url' => $_REQUEST['url'],
  'index' => $_REQUEST['index'],
  'status' => get_url_status($_REQUEST['url'])
);

print json_encode($output);

function get_url_status($url) {
  $ch = @curl_init($url);
  @curl_setopt($ch, CURLOPT_HEADER, TRUE);
  @curl_setopt($ch, CURLOPT_NOBODY, TRUE);
  @curl_setopt($ch, CURLOPT_FOLLOWLOCATION, FALSE);
  @curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
  $status = array();
  preg_match('/HTTP\/.* ([0-9]+) .*/', @curl_exec($ch) , $status);
  return ($status[1]) ? $status[1] : 'no response';
}

?>
