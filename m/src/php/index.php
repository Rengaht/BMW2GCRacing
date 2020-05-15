
<?php
	$host='https://event.bmw.com.tw/campaign/2020/the2_racing_challenge/m/src/php/';
	// $page_url=$host;	
	// echo $page_url;
	$img_url=$host.'output/'.$_GET['id'].'.png';	
	// echo $img_url;
?>
<html prefix='og: http://ogp.me/ns#'>
<head>	
	<!-- Global site tag (gtag.js) - Google Analytics -->
	

	<meta charset="UTF-8">
	
	<meta property="fb:app_id" content="251428186061075" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="橫型有禮！THE 2 Racing Challenge等你來挑戰！" />
	<meta property="og:description" content="立即接招，體驗全新首創BMW 2系列Gran Coupé帶來的駕馭樂趣！" />
	<meta property="og:url" content="<?php echo $img_url?>" />	
	<meta property="og:image" content="<?php echo $img_url?>" />	
	<meta property="og:site_name" content="橫型有禮！THE 2 Racing Challenge等你來挑戰！" /> 
</head>
<body>
	<script>
		setTimeout(function(){
			window.location.href="https://event.bmw.com.tw/campaign/2020/the2_racing_challenge/m/";
		},1000);
	</script>	
</body>

</html>