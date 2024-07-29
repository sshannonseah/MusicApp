const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();


// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'c237_musicapp' ,
    host: 'pro.freedb.tech',
    user: 'qwerty',
    password:'NSb@v5v4BN%7N4n',
    database:'freedb_music_app'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// Enable static files
app.use(express.static('public'));

//Enable form processing
app.use(express.urlencoded({
    extended: false
}));

//set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


//--------------------------------------------------
// L08 AM - Read

//R - get all items  (it can be "/" or "/getAllItems")
app.get("/", (req, res) => {
    //database mysql connection
    const sql = "SELECT * FROM music"
    connection.query(sql, (error, results) => {
        if (error) {
            console.log("Database error", error);
            return res.status(500).send("Database error");
        }
        res.render('index', { music: results }); // Render HTML page with data
    });

});

//R - get item by id (it can be "/product/:id" or "/getAllItems/:id")
app.get("/music/:id", (req, res) => {
    const id = req.params.id;

    //database mysql connection
    const sql = "SELECT * FROM music WHERE musicId = ?"
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.log("Database error", error);
            return res.status(500).send("Database error");
        }
        console.log("Fetched music item:", results[0]);
        res.render('music', { music: results[0] }); // Render HTML page with data
    });
});

app.get('/playlist', (req, res) => {
    res.render('playlist');
});

//--------------------------------------------------
// L08 PM - Create, Update, Delete


//C - display form for adding form
app.get("/addMusic", (req, res) => {
    res.render("addMusic");
});


//C - process form submission for adding music
app.post("/addMusic", upload.single('image'), (req, res) => {
    //Extract data
    const { title, artist, releaseDate } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = "noImage.png";
    }

    //optional print for debugging
    console.log("title: " + title);
    console.log("artist: " + artist);
    console.log("releaseDate: " + releaseDate);
    console.log("Image: " + image);

    //insert into database
    sql = "INSERT INTO music (title, artist, releaseDate, image) VALUES (?, ?, ?, ?)";
    connection.query(sql, [title, artist, releaseDate, image], (error, results) => {
        if (error) {
            console.log("Database error", error);
            return res.status(500).send("Database error");
        }
        res.redirect("/"); // Redirect to home page
    });


});

//L09 - Update
app.get("/editMusic/:id", (req, res) => {
    const musicId = req.params.id;

    //task - query database for existing data
    const sql = 'SELECT * FROM music WHERE musicId = ?';
    connection.query(sql, [musicId], (error, results) => {
        if (error) {
            console.log("Database error", error.message);
            return res.status(500).send("Database error");
        }

        res.render('editMusic', { music: results[0] }); // Render HTML page with the first row
    });

});

app.post("/editMusic/:id", upload.single('image'), (req, res) => {
    //res.send("Edit product processing");

    //task - extract data from form submission
    const musicId = req.params.id;
    const { title, artist, releaseDate} = req.body;
    let image = req.body.currentImage;

    if(req.file){
        image = req.file.filename
    }

    const sql = "UPDATE music SET title = ?, artist = ?, releaseDate = ?, image = ? WHERE musicId = ?";
    connection.query(sql, [title, artist, releaseDate, image, musicId], (error, results) => {
        if (error) {
            console.log("Error updating database", error);
            return res.status(500).send("Error updating database");
        } else {
            res.redirect("/");
        }
    });

});

//L09 - Delete
app.get("/deleteMusic/:id", (req, res) => {
    const musicId = req.params.id;

    //task - query database for existing data
    const sql = "DELETE FROM music WHERE musicId = ?";
    connection.query(sql, [musicId], (error, results) => {
        if (error) {
            console.log("Error deleting music", error);
            return res.status(500).send("Error deleting music");
        }
        res.redirect("/");
    });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));