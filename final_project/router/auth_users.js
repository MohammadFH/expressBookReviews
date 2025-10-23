const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require('express-session');
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let filterd_users = users.filter(user => user.username === username);

  return filterd_users.length === 0;
}

const authenticatedUser = (username,password)=>{ 
  let filterd_users = users.filter(user => (user.username === username 
                                              &&  user.password === password));
  return filterd_users.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if(username && password)
  {
    if(authenticatedUser(username , password))
    {
      let accessToken = jwt.sign({data : password} , 'access' , {expiresIn : 60 * 60});
      req.session.authorization = {
        accessToken , username
      }
      res.status(200).send("User logged in successfully.");
    }
    else 
    {
      res.send("User not authenticated!");
    }
  }
  else {
    res.send("Error in providing username and/or password");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
   const isbn = req.params.isbn;
   const book = books[isbn];
   if(book)
   {
    const username = req.session.authorization['username'];
    const review = req.query.review;
    book.reviews[username] = review;
    books[isbn] = book;
    res.status(200).send("Review has been added (modified) successfully.");
   }
   else {
    res.send(`Book with isbn ${isbn} not found!`);
   }

});

regd_users.delete("/auth/review/:isbn" , (req , res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book)
  {
    const username = req.session.authorization['username'];
    delete book.reviews[username];
    books[isbn] = book;
    res.status(200).send("Review has been deleted successfully.");
  }
  else {
        res.send(`Book with isbn ${isbn} not found!`);
  }
  
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
