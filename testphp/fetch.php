<?php
	try{
			$dbhost = $_SERVER['RDS_HOSTNAME'];
			$dbport = $_SERVER['RDS_PORT'];
			$dbname = $_SERVER['RDS_DB_NAME'];

			$dsn = "mysql:host={$dbhost};port={$dbport};dbname={$dbname}";
			$username = $_SERVER['RDS_USERNAME'];
			$password = $_SERVER['RDS_PASSWORD'];

	        $db = new PDO($dsn, $username, $password);
	} catch (Exception $e) {
	        echo 'Exception: '. $e->getMessage();
	}

	try {
        // get request params
        $no = 0; // default value
        if (isset($_GET['getresult'])) {
                $no = intval($_GET['getresult']);
        }

        // select items for page params
		$sql = 'SELECT name, gender, message FROM testphp_messages ORDER BY ID DESC LIMIT :no, 10';
		$query = $db->prepare($sql);
		$query->bindParam(':no', $no, PDO::PARAM_INT);
		$query->execute();
		$list = $query->fetchAll();

		foreach ($list as $row) {
				$name = htmlspecialchars($row['name']);
				$gender = htmlspecialchars($row['gender']);
				$message = htmlspecialchars($row['message']);
				echo '<blockquote><p>'.$message.'</p><cite>'.$name.' ('.$gender.')</cite></blockquote>';
		}

    } catch (PDOException $e) {
            echo 'PDOException : '.  $e->getMessage();
    }

?>
