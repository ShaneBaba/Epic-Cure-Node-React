const bcrypt = require("bcrypt");

const password = "epiccureGrantwriter";

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});