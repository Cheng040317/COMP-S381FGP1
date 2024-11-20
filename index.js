const express = require('express')
const mongoose = require('mongoose')
const path = require("path")
const config = require("./config")

const Cookies = require('cookies')
const app = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(function (req, res, next) {
    let cookies = new Cookies(req, res);
    let user = cookies.get("user");
    if (user) {
        req.user = JSON.parse(user);
    }
    next();
})

app.use(express.static(__dirname + "/public"));
app.use('/uploads', express.static(__dirname + "/uploads"));
app.use(express.urlencoded({ extended: false }));

// Route setup
const authRoutes = require('./routers/authRoutes');
const userRoutes = require('./routers/userRoutes');
const adminRoutes = require('./routers/adminRoutes');
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/admin', auth, adminRoutes);

function auth(req, res, next) {
    if (req.path === '/login') {
        return next();
    }
    if (req.user && (req.user.role == 'admin')) {
        return next();
    } else {
        res.redirect('/login');
    }
}

mongoose.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const conn = mongoose.connection;
conn.once('open', function () {
    console.log("Database connection successful");
    app.listen(config.app.port, () => {
        console.log(`Application is running and listening on port: ${config.app.port}`)
    })
})
conn.on('error', function (err) {
    console.log("Database connection failed: " + err);
})