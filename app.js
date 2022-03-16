const express = require("express"),
    appp = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    User = require("./models/User"),
    Course = require("./models/Course"),
    Task = require("./models/Task");
//Connecting database
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 3000;






mongoose.connect("mongodb+srv://nirmallyadey2:cK5N6NWxU6mytXw4@nirmallya.0hzzq.mongodb.net/lms?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,


    })
    .then((res) => appp.listen(port, () => console.log("get your network and connect to port 3000")))
    .catch((err) => console.log(err));

// mongoose
//   .connect(process.env.DB_CONNECT, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
// .then((res) => appp.listen(port, () => console.log("Server Up and running")))
// .catch((err) => console.log(err));


appp.use(express.urlencoded({
    extended: true
}));

appp.use(
    require("express-session")({
        secret: "Lets make the project",
        resave: false,
        saveUninitialized: false,
    })
);
appp.set("view engine", "ejs");
passport.use(new LocalStrategy(User.authenticate()));
passport.deserializeUser(User.deserializeUser());
passport.serializeUser(User.serializeUser());
appp.use(bodyParser.urlencoded({
    extended: true
}));
appp.use(passport.initialize());

appp.use(passport.session());
appp.get("/", (req, res) => {
    let authe = "";
    if (req.isAuthenticated()) authe = "logged";
    else authe = "logout";

    res.render("home", {
        auth: authe
    });
});
appp.get("/userprofile", isLoggedIn, (req, res) => {
    res.render("userprofile", {
        userdetails: req.user
    });
});
//Auth Routes
appp.get("/login", (req, res) => {
    res.render("login");
});
appp.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/userprofile",
        failureRedirect: "/login",
    }),
    function(req, res) {}
);
appp.get("/register", (req, res) => {
    res.render("register");
});
appp.post("/register", (req, res) => {
    User.register(
        new User({
            phone: req.body.phone,
            username: req.body.username,
            language: req.body.language,
            email: req.body.email,
            role: req.body.role,
        }),
        req.body.password,
        function(err, user) {
            if (err) {
                console.log(err);
                res.render("register");
            }
            passport.authenticate("local")(req, res, function() {
                res.redirect("/login");
            });
        }
    );
});
appp.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

appp
    .route("/edit/:id")
    .get((req, res) => {
        const id = req.params.id;
        User.find({}, (err, user) => {
            res.render("userprofile.ejs", {
                userdetails: user
            });
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        User.findByIdAndUpdate(
            id, {
                phone: req.body.phone,
                role: req.body.role,
                language: req.body.language,
                email: req.body.email,
            },
            (err) => {
                if (err) return res.send(500, err);
                res.redirect("/userprofile");
            }
        );
    });

appp.get("/task", isLoggedIn, (req, res) => {
    Task.find({}, (err, tasks) => {
        res.render("task.ejs", {
            Tasks: tasks
        });
    });
});

appp.post("/task", isLoggedIn, async(req, res) => {
    let ch;
    if (req.body.comp == "on") ch = "Completed";
    else ch = "Not Completed";
    const todoTask = new Task({
        content: req.body.content,
        iscomplete: ch,
    });

    try {
        await todoTask.save();
        res.redirect("/task");
    } catch (err) {
        console.log(err);
        res.redirect("/task");
    }
});

appp
    .route("/task/edit/:id")
    .get((req, res) => {
        const id = req.params.id;
        Task.find({}, (err, tasks) => {
            res.render("taskedit.ejs", {
                Tasks: tasks,
                idTask: id
            });
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        Task.findByIdAndUpdate(id, {
            content: req.body.content
        }, (err) => {
            if (err) return res.send(500, err);
            res.redirect("/task");
        });
    });

appp.route("/task/remove/:id").get((req, res) => {
    const id = req.params.id;
    Task.findByIdAndRemove(id, (err) => {
        if (err) return res.send(500, err);
        res.redirect("/task");
    });
});

appp.get("/course", isLoggedIn, (req, res) => {
    Course.find({}, (err, courses) => {
        res.render("course.ejs", {
            Courses: courses
        });
    });
});