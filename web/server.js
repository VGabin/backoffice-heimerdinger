require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { getAllLastestPayments } = require("./src/services/payments")
const { getAllSubscriptions } = require("./src/services/subscriptions")
const app = express();
app.use(express.urlencoded({ extended: true }));

const authenticationRoutes  = require("./src/routes/authentication");
const apiRoutes             = require("./src/routes/api");
const authorizedUsers       = process.env.AUTHORIZED_USERS ? process.env.AUTHORIZED_USERS.split(",").map(u => u.trim()) : [];

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.set('view engine', 'pug');
app.set('views', './src/views');
app.use(express.static("public"));

function checkAuthorization(req, res, next) {
  if (req.session.user) {
    if (!req.session.user || !authorizedUsers.includes(req.session.user.username)) {
      return res.status(403).render("unauthorized", { message: "Accès refusé." });
    }

    next();
  } else {
    res.render("login", {
      clientId: process.env.DISCORD_ID,
      redirectUri: process.env.REDIRECT_URI,
    });
  }
}

app.get("/", checkAuthorization, (req, res) => {
  res.render("index", { user: req.session.user });
});

app.get("/abonnements", checkAuthorization, async (req, res) => {
  const subscriptions = await getAllSubscriptions();
  res.render("subscription", { user: req.session.user, subscriptions : subscriptions });
});

app.get("/transactions", checkAuthorization, async (req, res) => {
  const payments = await getAllLastestPayments();
  res.render("transaction", { user: req.session.user, payments : payments });
});

app.use("/oauth2", authenticationRoutes);
app.use("/api", apiRoutes);

app.listen(3000);
