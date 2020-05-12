<?php
	/**
	 * Send debug code to the Javascript console
	 * Simulate the console.log from PHP
	 */ 
	class console
	{
		static public function log($data) {
			// echo("<script>console.log('Log from PHP:');</script>");
		    if(is_array($data) || is_object($data))
			{
				echo("<script>console.log(".json_encode($data).");</script>");
			} else {
				echo("<script>console.log(".$data.");</script>");
			}
		}
	}
?>