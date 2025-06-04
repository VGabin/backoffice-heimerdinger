require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { getAllLastestPayments } = require("./src/services/payments")
const { getAllSubscriptions } = require("./src/services/subscriptions")
const app = express();

const authenticationRoutes = require("./src/routes/authentication");
const apiRoutes = require("./src/routes/api");

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

app.get("/", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.render("login", {
      clientId: process.env.DISCORD_ID,
      redirectUri: process.env.REDIRECT_URI,
    });
  }
});

app.get("/abonnements", async (req, res) => {
  if (req.session.user) {
    const subscriptions = await getAllSubscriptions();
    res.render("subscription", { user: req.session.user, subscriptions : subscriptions });
  } else {
    res.render("login", {
      clientId: process.env.DISCORD_ID,
      redirectUri: process.env.REDIRECT_URI,
    });
  }
});

app.get("/transactions", async (req, res) => {
  if (req.session.user) {
    const payments = await getAllLastestPayments();
    res.render("transaction", { user: req.session.user, payments : payments });
  } else {
    res.render("login", {
      clientId: process.env.DISCORD_ID,
      redirectUri: process.env.REDIRECT_URI,
    });
  }
});

app.use("/oauth2", authenticationRoutes);
app.use("/api", apiRoutes);

app.listen(3000);
