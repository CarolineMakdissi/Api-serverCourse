let app = require("express")(); //Install express- connect with the server
app.listen(3100);
console.log("Servern körs på port 3100");
const crypto = require("crypto"); //Install crypto -
//is imported to use the Node.js cryptography module, which provides functions for cryptographic operations.
const jwt = require("jsonwebtoken");

const hash = (data) => crypto.createHash("sha256").update(data).digest("hex");



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

/**  GET **/

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

/** PUT **/
app.put("/users/:id", function (req, res) {
  if (
    !(
      req.body &&
      req.body.username &&
      req.body.password &&
      req.body.name &&
      req.body.email
    )
  ) {
  }
  let sql = `UPDATE users 
SET username = ?,password= ?, name = ?, email = ?
WHERE id = ?`;

  let values = [
    req.body.username,
    req.body.password,
    req.body.name,
    req.email,
    req.params.id,
  ];

  con.query(sql, values, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error creating a uppdate");
    }
    res.status(201).send("Successfully Uppdated");
  });
});


/**  POST -login **/
app.post("/login", function (req, res) {
  //code here to handle calls…
  let sql = `SELECT * FROM users WHERE users=?`;
  let values = [req.body.username, password];

  con.query(sql, values, function (err, result, fields) {
    if (err) {
      throw err;
    }
    if (result.length == 0) {
      res.sendStatus(401);
      return;
    }

    let hashPassword = hash(req.body.password);
    console.log(hashPassword);
    console.log(result[0].password);
    if (result[0].password == passwordHash) {
      res.send({
        //Do not return password!
        username: result[0].username,
      });
    } else {
      res.sendStatus(401);
    }
  });
});
