let app = require("express")(); //Install express- connect with the server
app.listen(3100);
console.log("Servern körs på port 3100");
const crypto = require("crypto"); //Install crypto

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/doc.html");
});

const mysql = require("mysql"); //Intstall mysql- connect with the database
con = mysql.createConnection({
  host: "localhost", // database-server IP-adress
  user: "root",
  password: "",
  database: "api",
  multipleStatements: true,
});

app.get("/users", function (req, res) {
  let sql = "SELECT id,name,username,email FROM users";
  // Send query to database
  con.query(sql, function (err, result, fields) {
    res.send(result);
  });
});

// route-parameter, filter after ID in the URL
app.get("/users/:id", function (req, res) {
  // The value for id is located in req.params
  let sql = "SELECT id, username, name, email FROM users WHERE id=?";
  let userId = req.params.id;

  // Send query to databasen
  con.query(sql, [userId], function (err, result, fields) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving user");
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.sendStatus(204); // 204=not found
    }
  });
});

/*** POST ***/
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Create a new user in the database
app.post("/users", function (req, res) {
  const { username, password, name, email } = req.body;

  if (!username || !password || !name || !email) {
    return res.status(400).send("Missing required fields");
  }

  // Create the SQL query with prepared statement to insert a new user into the 'users' table
  let sql = `INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)`;
  let values = [username, password, name, email];

  // Execute the query with prepared statement to insert a new user
  con.query(sql, values, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error creating user");
    }
    res.status(201).send("User created successfully");
  });
});
