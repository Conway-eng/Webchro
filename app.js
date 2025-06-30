const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Mock databases (for demo only)
let users = [
  { username: "admin", password: "admin", coins: 1000, referrals: 3, referredBy: "", email: "admin@hacklink.com" },
  { username: "alice", password: "pass", coins: 50, referrals: 0, referredBy: "", email: "alice@example.com" },
  { username: "bob", password: "pass", coins: 30, referrals: 1, referredBy: "alice", email: "bob@example.com" },
];
let complaints = [];
let bots = [];

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "hacklinkSecret",
  resave: false,
  saveUninitialized: true,
}));

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.user?.username !== "admin") return res.redirect("/");
  next();
}

app.get("/", requireLogin, (req, res) => {
  let user = req.session.user;
  res.render("dashboard", {
    user,
    countdown: 30,
    whatsappLink: "https://whatsapp.com/channel/0029Vb6Gy5XDzgTBTarvMW1O",
    claimedToday: user.claimedAt && Date.now() - user.claimedAt < 24 * 3600000,
    referralCode: user.username,
  });
});

app.post("/claim-coins", requireLogin, (req, res) => {
  let user = req.session.user;
  if (user.claimedAt && Date.now() - user.claimedAt < 24 * 3600000) return res.redirect("/");
  user.coins += 10;
  user.claimedAt = Date.now();
  res.redirect("/");
});

app.post("/submit-referral", requireLogin, (req, res) => {
  let refEmail = req.body.referredEmail;
  let user = req.session.user;
  if (!refEmail) return res.redirect("/");
  let referredUser = users.find(u => u.email === refEmail && u.username !== user.username);
  if (referredUser && !referredUser.referredBy) {
    referredUser.referredBy = user.username;
    user.coins += 10;
    user.referrals = (user.referrals || 0) + 1;
  }
  res.redirect("/");
});

app.post("/transfer-coins", requireLogin, (req, res) => {
  let { recipientEmail, coinAmount } = req.body;
  let amount = parseInt(coinAmount, 10);
  if (!recipientEmail || isNaN(amount) || amount < 1) return res.redirect("/");
  let user = req.session.user;
  let recipient = users.find(u => u.email === recipientEmail);
  if (!recipient || user.coins < amount) return res.redirect("/");
  user.coins -= amount;
  recipient.coins += amount;
  res.redirect("/");
});

app.get("/complaints", requireLogin, (req, res) => {
  res.render("complaints", { user: req.session.user });
});

app.post("/complaints", requireLogin, (req, res) => {
  // For demo, just store in memory
  complaints.push({
    email: req.body.email,
    message: req.body.message,
    submittedBy: req.session.user.username,
    date: new Date(),
  });
  res.render("complaints", { user: req.session.user, submitted: true });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  let user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    if (username === "admin") return res.redirect("/admin");
    return res.redirect("/");
  }
  res.render("login", { error: "Invalid credentials" });
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", (req, res) => {
  let { username, password, email } = req.body;
  if (!username || !password || users.find(u => u.username === username)) {
    return res.render("register", { error: "Invalid or duplicate username" });
  }
  let newUser = { username, password, coins: 0, referrals: 0, referredBy: "", email: email || `${username}@example.com` };
  users.push(newUser);
  req.session.user = newUser;
  res.redirect("/");
});

app.get("/admin", requireLogin, requireAdmin, (req, res) => {
  res.render("admin", {
    users,
    bots,
    complaints,
    user: req.session.user,
    totalCoins: users.reduce((sum, u) => sum + u.coins, 0)
  });
});

app.post("/admin/add-bot", requireLogin, requireAdmin, (req, res) => {
  let { botName, botDesc, botEnv } = req.body;
  bots.push({
    name: botName,
    description: botDesc,
    env: botEnv,
  });
  res.redirect("/admin");
});

app.post("/admin/reset-coins", requireLogin, requireAdmin, (req, res) => {
  users.forEach(u => u.coins = 0);
  res.redirect("/admin");
});

app.post("/admin/set-coins", requireLogin, requireAdmin, (req, res) => {
  let { username, amount } = req.body;
  let user = users.find(u => u.username === username);
  if (user) user.coins = parseInt(amount, 10) || 0;
  res.redirect("/admin");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
