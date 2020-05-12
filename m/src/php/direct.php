<?php
	$host='https://event.bmw.com.tw/campaign/2020/the2_racing_challenge/m/src/php/';
	// $host='http://127.0.0.1/BMW2GCRacing/src/php/';
	$page_url=$host.'direct.php';	
	// echo $page_url;
	$img_url=$host.'output/'.$_GET['id'].'.png';	
	$share_url=$host.'index.php?id='.$_GET['id'];	
	$redirect_url=$host.'redirect.html';
	// echo $img_url;
?>

<html>
	<head>		
		
		<title>The 2 Racing Challenge</title>		
		<style type="text/css">
			body{
				border:0;
				margin:0;
				background-color: #001368;			
			}
			a{
				/*color:rgb(13,104,171);*/
			}
			.vertCenterWrapper{
				display: table;
				height:80%;
				width:100%;
			}
			.vertCenterChild{
				display:table-cell;
				vertical-align: middle;
			}
			.share_img{
				/*margin-top:2rem;			*/
				max-width: 90vw;
    			max-height: 60vh;

				border:5px white solid;
				box-shadow: 12px 12px 7px rgba(0, 0, 0, 0.2);
			}
			.share_button{
				margin-top:2rem;
				margin-bottom:2rem;
				height:5rem;
				cursor: pointer;
			}
			.center{
				display:block;
				text-align: center;
				margin-left: auto;
				margin-right: auto;
			}
			
		</style>
		<script type="text/javascript">
			var _url=encodeURIComponent('<?php echo $share_url ?>');
			//var _text=encodeURIComponent("quote_here!");
			var _tag=encodeURIComponent("#The2RacingChallenge");
			var _reurl=encodeURIComponent('<?php echo $redirect_url ?>');	

			var _share_url="https://www.facebook.com/dialog/share?"
							+"app_id=251428186061075"
							+"&href="+_url
							+"&hashtag="+_tag
							+"&redirect_uri="+_reurl;
			function onShareclick(){								
	    		console.log(_share_url);
				window.location = _share_url;
			}
		</script>
		
		
	</head>
	<body>		
		<div class="vertCenterWrapper">
			<div class="vertCenterChild RedirectText">
				<?php 
					echo '<img class="share_img center" src="'.$img_url.'"/>';
				?>
			<img class="center share_button" onclick="onShareclick()" src="img/share-01.png"/> 

			</div>
		</div>
	</body>
</html>