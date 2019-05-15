<!DOCTYPE html>
<!--[if IE 8 ]><html class="no-js oldie ie8" lang="en"> <![endif]-->
<!--[if IE 9 ]><html class="no-js oldie ie9" lang="en"> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--><html class="no-js" lang="en"> <!--<![endif]-->
<head>

	<!--- basic page needs
	================================================== -->
	<meta charset="utf-8">
	<title>Test PHP</title>
	<meta name="description" content="">  
	<meta name="author" content="Preetham Reddy Narayanareddy">

	<!-- mobile specific metas
	================================================== -->
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

	<!-- CSS
	================================================== -->
	<link rel="stylesheet" href="../css/base.css">  
	<link rel="stylesheet" href="../css/main.css">
	<link rel="stylesheet" href="../css/vendor.css">     

	<!-- script
	================================================== -->   
	<script src="../js/modernizr.js"></script>
	<script src="../js/pace.min.js"></script>

	<!-- favicons
	================================================== -->
	<link rel="icon" type="/image/png" href="../favicon.png">

</head>

<body id="top">

<section id="intro-small">

	<div class="intro-overlay"></div>	

		<div class="intro-content">
			<div class="row">

				<div class="col-twelve">
					<h1>Test PHP</h1>
				</div>  
			</div>	 		
		</div> <!-- /intro-content --> 

</section>	

<section id="standard">

	<div class="row section-intro">

		<div class="col-twelve">

			<p class="lead">This is a simple test application which will take your input and put it into a database when you click submit. The results you see underneath are the first 10 results that have been inputed and clicking "See More" will show you the next 10.</p>   			

		</div>

	</div> <!-- /row -->



	<div class="row">

		<div class="col-six tab-full">

			<form method="post">
				<div>
					<label for="name">Your Name</label>
					<input class="full-width" type="text" maxlength="50" placeholder="Name (max 50 char)" id="name" name="name">
				</div>
				<div>
					<label for="gender">What sex do you identify as?</label>
					<div class="ss-custom-select">
						<select class="full-width" id="gender" name="gender">
							<option value="Male">Male</option>
							<option value="feMale">feMale</option>
							<option value="Asian (not Latino or Hispanic)">Asian (not Latino or Hispanic)</option>
							<option value="Attack Helicopter">Attack Helicopter</option>
							<option value="Cat.">Cat.</option>
							<option value="Other">Other</option>
						</select>
					</div>
				</div>
			   
				<label for="message">Message</label>
				<textarea class="full-width" maxlength="1000" placeholder="Your message (max 1000 char)" id="message" name="message"></textarea>
			   
				<input class="button-primary" type="submit" name="submit" value="Submit">
				
			</form>
			<?php
				if(isset($_POST['submit'])) {
					try {
						$dbhost = $_SERVER['RDS_HOSTNAME'];
						$dbport = $_SERVER['RDS_PORT'];
						$dbname = $_SERVER['RDS_DB_NAME'];

						$dsn = "mysql:host={$dbhost};port={$dbport};dbname={$dbname}";
						$username = $_SERVER['RDS_USERNAME'];
						$password = $_SERVER['RDS_PASSWORD'];

						$db = new PDO($dsn, $username, $password);
					} catch (Exception $e) {
						echo "Error: " . $e->getMessage();
					}

					try {
						$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

						$name = $_POST['name'];
						$gender = $_POST['gender'];
						$message = $_POST['message'];

						if (strlen($name) > 50 || strlen($gender) > 50 || strlen($message) > 1000 || strlen($name) <= 0 || strlen($gender) <= 0 || strlen($message) <= 0) {
							echo '<div class="alert-box ss-error hideit"><p>';
							if(strlen($name) > 50) {
								echo "Name too long. Didn't submit";
							} else if (strlen($gender) > 50) {
								echo "Gender too long. Didn't submit";
							} else if (strlen($message) > 1000) {
								echo "Message too long. Didn't submit";
							} else if (strlen($name) <= 0 || strlen($gender) <= 0 || strlen($message) <= 0) {
								echo "You need to fill out the entire form";
							} else {
								echo "... This shouldn't have happened. This is awkward. btw. Didn't submit.";
							}
							echo '</p><i class="fa fa-times close"></i></div><!-- /error -->';
						} else {
							$params = array(":name" => $name, ":gender" => $gender, ":message" => $message);
							$db->beginTransaction();
							$db->prepare('INSERT INTO testphp_messages (name, gender, message) VALUES (:name, :gender, :message)')->execute($params);
							$db->commit();
							echo '<div class="alert-box ss-success hideit"><p>Success!</p><i class="fa fa-times close"></i></div><!-- /success -->';
						}
					} catch (PDOException $e) {
						$db->rollback();
						echo "Error: " . $e->getMessage();
					}
					$db = null;
				}
			?>
		</div>

		<div class="col-six tab-full">

			<div id="results">
				<h3>Previous entries</h3>
				<!--inspiration-->
				<!--<blockquote>
					<p>Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. And the only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it.</p>
					<cite>Steve Jobs (Founder of Apple)</cite>
			   	</blockquote>-->
				<?php 
					try {
						$dbhost = $_SERVER['RDS_HOSTNAME'];
						$dbport = $_SERVER['RDS_PORT'];
						$dbname = $_SERVER['RDS_DB_NAME'];

						$dsn = "mysql:host={$dbhost};port={$dbport};dbname={$dbname}";
						$username = $_SERVER['RDS_USERNAME'];
						$password = $_SERVER['RDS_PASSWORD'];

						$db = new PDO($dsn, $username, $password);
					} catch (Exception $e) {
						echo "Error: " . $e->getMessage();
					}

					try {
						$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

						$result = $db->query("SELECT name, gender, message FROM testphp_messages ORDER BY ID DESC LIMIT 10");

						if ($result->rowCount() > 0) {
						    while ($row = $result->fetch()) {
						    	$name = htmlspecialchars($row['name']);
						    	$gender = htmlspecialchars($row['gender']);
						    	$message = htmlspecialchars($row['message']);
								echo '<blockquote><p>'.$message.'</p><cite>'.$name.' ('.$gender.')</cite></blockquote>';
						    }
						} else {
						    echo "<p>No one said anything...</p>";
						}
					} catch (PDOException $e) {
						echo "Error: " . $e->getMessage();
					}
					$db = null;
				?>
			</div>
			<input type="hidden" id="result_no" value="10">
			<input class="button-primary" type="submit" name="seemore" id="seemore" value="See More">
		</div>

	</div> <!-- /row -->

</section> <!--styles -->	


<!-- Java Script
================================================== --> 
<script src="../js/jquery-2.1.3.min.js"></script>
<script src="../js/plugins.js"></script>
<script src="../js/main.js"></script>
<script type="text/javascript">
	$(document).ready(function(){
		$("#seemore").click(function(){
			loadmore();
		});
	});

	function loadmore() {
		var val = document.getElementById("result_no").value;
		$.get('fetch.php', {getresult:val}, function(response) {
	        var content = document.getElementById("results");
	        content.innerHTML = content.innerHTML+response;
	        document.getElementById("result_no").value = Number(val)+10;
		}).fail(function(){alert("If you're seeing this then something bad happened...");});
	}
</script>

</body>

</html>