<?php
error_reporting(~E_ALL);
$tokens = array(""); // Tokens go here

$allowedFiles = array("png", "jpg", "gif", "txt");
 
$sharexdir = "./"; // File directory
$lengthofstring = 3; // Length of file name

$json = new StdClass();

// Random file name generation
function RandomString($length) {
    $keys = array_merge(range(0,9), range('a', 'z'));
 
    $key = "";
    for($i=0; $i < $length; $i++) {
        $key .= $keys[mt_rand(0, count($keys) - 1)];
    }

    return $key;
}
 
// Check for token
/* if(isset($_POST['secret']))
{
    // Checks if token is valid
    if(in_array($_POST['secret'], $tokens))
    { */
        // Prepares for upload
        $filename = RandomString($lengthofstring);
        $target_file = $_FILES["sharex"]["name"];
        $fileType = pathinfo($target_file, PATHINFO_EXTENSION);
        
        // Check if mime type is listed
        if(!in_array($fileType, $allowedFiles)) {
            http_response_code(406); // Return 406 Not Acceptable status code
            $json->status = "Failed";
            $json->errormsg = "This filetype is not allowed!";

        // Accepts and moves to directory
        } else if (move_uploaded_file($_FILES["sharex"]["tmp_name"], $sharexdir.$filename.'.'.$fileType)) {
            //Sends info to client
            $json->status = "OK";
            $json->errormsg = null;
            $json->url = $filename . '.' . $fileType;
        }  else {
            // Warning
            http_response_code(400); // Return 400 Bad Request status code
            $json->status = "Failed";
            $json->errormsg = "File upload failed - CHMOD/Folder doesn\'t exist?";
        }  
// Sends json
echo(json_encode($json));
?>