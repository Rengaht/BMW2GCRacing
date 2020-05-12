<?php

	class DateTimeHelper
	{
		static public function get_timestamp($format){
			date_default_timezone_set("Asia/Taipei");
			if($format === null){	$format = "Y-m-d H:i:s";	}
			return date($format);
		}
	}

?>