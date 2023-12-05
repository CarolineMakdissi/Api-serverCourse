

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
  
  const COLUMNS = ["id", "username", "password", "name", "email"]; // Columns on the database
  
  /*** GET ***/
  // Return a database tabel - JSON
  app.get("/users", function (req, res) {
    let sql = "SELECT * FROM users"; 
    let condition = createCondition(req.query); // output t.ex. " WHERE username='Caroline'"
    console.log(sql + condition); // t.ex. SELECT * FROM users WHERE username="Caroline"
    // Send query to database
    con.query(sql + condition, function (err, result, fields) {
      res.send(result);
    });
  });
  
  let createCondition = function (query) {
    // Create a WHERE-term based on query-parameter
    console.log(query);
    let output = " WHERE ";
    for (let key in query) {
      if (COLUMNS.includes(key)) {
        // If we have a columnname in our query
        output += `${key}="${query[key]}" OR `; // t.ex. username="Caroline"
      }
    }
    if (output.length == 7) {
      // " WHERE "
      return ""; // If query is empty or is not relevant for our database tabel - return a empty string
    } else {
      return output.substring(0, output.length - 4); // remove last " OR "
    }
  };
  
  app.get("/users/name-email", function (req, res) {
    let sql = "SELECT name, email FROM users"; 
    let condition = createCondition(req.query); 
    console.log(sql + condition); 
    // Send query to database
    con.query(sql + condition, function (err, result, fields) {
      res.send(result);
    });
  });

  
  // route-parameter, filter after ID in the URL
  app.get("/users/:id", function (req, res) {
    // The value for id is located in req.params
    let sql = "SELECT * FROM users WHERE id=" + req.params.id;
    console.log(sql);
    // Send query to databasen
    con.query(sql, function (err, result, fields) {
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
      const { username, password, name, email } = req.body; // Extra user details from request body
    
      if (!username || !password || !name || !email) {
        // Check if all required fields are provided
        return res.status(400).send("Missing required fields");
      }

      // Create the SQL query to insert a new user into the 'users' table
      let sql = `INSERT INTO users (username, password, name, email) VALUES ('${username}', '${password}', '${name}', '${email}')`;
    
      // Execute the query to insert a new user
      con.query(sql, function (err, result) {
        if (err) {
          console.error(err);
          return res.status(500).send("Error creating user");
        }
        res.status(201).send("User created successfully");
      });
    });


    /**  PUT **/ //Uppdaterar befintlig användare baserat på deras id 
    

    /** POST **/ // 