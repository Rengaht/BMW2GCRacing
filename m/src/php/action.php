<?php
	
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	

	header("Access-Control-Allow-Origin: *");
	header('Content-Type: text/html; charset=utf-8');

	date_default_timezone_set("Asia/Taipei");

	//Return as json file
	header('Content-Type: application/json');

	function createImage($id_,$name_,$color_,$score_,$rank_){
		$base_image = imagecreatefrompng('../../asset/img/share/share_'.$color_.'-01.png');
    	$image_width = imagesx($base_image);

		$color_name = imagecolorallocate($base_image,48,255,252);
		$color_score = imagecolorallocate($base_image,0,168,229);
		$color_rank = imagecolorallocate($base_image,255,136,90);
	    
	    // Set Path to Font File
	    // putenv(‘GDFONTPATH=’ . realpath(‘.’));
	    $font_path=realpath('../../asset/font/arudjingxiheipe1xg30_hv.ttf');
	    // echo $font_path;

	    $font_size=108;
	    $y=1012;
	 //    $name_text_box = imagettfbbox($font_size,0,$font_path,$name);
		// $name_text_width = $text_box[2]-$text_box[0];
		// $x = ($image_width/2) - ($text_width/2);
		imagefttext($base_image, $font_size, 0, 96,$y, $color_name, $font_path, $name_);
		imagefttext($base_image, $font_size, 0, 889,$y, $color_score, $font_path, $score_);
		imagefttext($base_image, $font_size, 0, 1239,$y , $color_rank, $font_path, $rank_);

	    imagepng($base_image,'output/'.$id_.'.png',-1);

	    imagedestroy($base_image);

	}
	
	$host='https://event.bmw.com.tw/campaign/2020/the2_racing_challenge/m/src/php/';	
	$share_url=$host.'direct.php?id=';
	try{
		
		$get_action=isset($_POST['action']) ? $_POST['action'] : NULL;
		$json['action']=$get_action;

		switch($get_action){
			case 'get_share_url':
				
				createImage($_POST['guid'],$_POST['name'],$_POST['color'],$_POST['score'],$_POST['rank']);
				
				$json['result']='success';
				$json['share_url']=$share_url.$_POST['guid'];
				
				echo json_encode($json);
				break;
			default:
				$json['result']='error! action: '.$get_action;
				echo json_encode($json);
				// createImage('test','test','red','123','999');
				break;				

		}
	}catch(Exception $e){
		echo 'Error: '.$e->getMessage();

	}
	

?>