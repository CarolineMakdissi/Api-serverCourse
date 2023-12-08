let app = require("express")(); //Install express- connect with the server
app.listen(3100);
console.log("Servern körs på port 3100");
const crypto = require("crypto"); //Install crypto -
//is imported to use the Node.js cryptography module, which provides functions for cryptographic operations.
const jwt = require("jsonwebtoken"); //Install jsonwebtoken

const hash = (data) => crypto.createHash("sha256").update(data).digest("hex");// Arrow function that takes input ex a password in clear text , hasesh it and return the hash value as string.

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/doc.html"); //Display documenation
});

const mysql = require("mysql"); //Intstall mysql- connect with the database
con = mysql.createConnection({
  host: "localhost", // database-server IP-adress
  user: "root",
  password: "",
  database: "api", //My database name
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
    res.status(204).send("Not Found!"); // 204=not found
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

  // Check if user already in the database, if exists then dont continue creating account
  const usenameSql = `SELECT COUNT(*) AS count FROM users WHERE username = ?`;
  con.query(usenameSql, [username], function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).send("Something went wrong when checking username!");
      return;
    }

    if (results[0].count > 0) {
      res.status(409).send("User already exsits!"); // duplicate http status
      return;
    }

    // Create the SQL query with prepared statement to insert a new user into the 'users' table
    const hashPassword = hash(password);
    const sql = `INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)`;
    const values = [username, hashPassword, name, email];

    // Execute the query with prepared statement to insert a new user
    con.query(sql, values, function (err, results) {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating user");
        return;
      }

      // send data
      res.status(200).send({
        id: results?.insertId,
        username,
        name,
        email,
      });
    });
  });
});

/** PUT **/
app.put("/users/:id", function (req, res) {
    const { username, password, name, email } = req.body;
    const { id } = req.params;
  
    if (!(req.body && username && password && name && email)) {
      res
        .status(400)
        .send("Missing required fields, need username, password, name, email");
      return;
    }
  
    const sql = "UPDATE users SET username = ?, password = ?, name = ?, email = ? WHERE id = ?";
    const hashPassword = hash(password);
    const values = [username, hashPassword, name, email, id];
  
    con.query(sql, values, function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send("Something went wrong when updating user");
      }
      res.status(202).send({ id, username, name, email }); // 202 http status - resource updated
    });
  });


/* POST -login */
app.post("/login", function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send("Missing required fields");
    return;
  }

  const sql = `SELECT * FROM users WHERE username = ? AND password = ?;`;
  const hashPassword = hash(password);
  const values = [username, hashPassword];

  con.query(sql, values, function (err, result) {
    if (err) {
      console.error(err);
      res.status(500).send("Something went wrong when updating user");
      return;
    }

    if (result.length == 0) {
      res.status(401).send("Username or password incorrect!"); // 401 http status - Unauthorized
      return;
    }

    const payload = {
      sub: result[0].username,
      name: result[0].name,
      email: result[0].email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration time, inpiration from jsonwebtoken docs
    };

    // return jwt token
    const token = jwt.sign(
      payload,
      "MinEgnaHemlighetSomIngenKanGissaXyz123%&/"
    );

    res.status(200).send(token);
  });
});
