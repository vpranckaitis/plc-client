<?php
if (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] != '') {
	header("Content-Type: text/plain; charset=UTF-8");
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
    curl_setopt($curl, CURLOPT_POSTFIELDS, file_get_contents("php://input"));

    curl_setopt($curl, CURLOPT_URL, 'localhost:8080/' . str_replace('/plc/', '', $_SERVER['REQUEST_URI']));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);

    http_response_code(curl_getinfo($curl, CURLINFO_HTTP_CODE));
    
    curl_close($curl);
    
    echo $result;
    
} else {
	header("Content-Type: text/html; charset=UTF-8");
	echo file_get_contents('app.html');
}
?>