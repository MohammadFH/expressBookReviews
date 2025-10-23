const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(username && password)
  {
    if(isValid(username))
    {
      users.push({"username" : username , "password" : password});
      res.status(200).send("User has been registerd successfully.");
    }
    else{
      res.status(404).send("Username already exists!");
    }
  }
  else
  {
    res.status(404).send("Error in providing username and/or password");
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let getBooks = new Promise((resolve , reject) => {
    if(books){
      resolve(books);
    }
    else{
      reject("No books found!");
    }
  });

  getBooks
  .then(response => res.json(response))
  .catch(error => res.status(404).json({message : error}));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  let getBookByISBN = new Promise ((resolve , reject) => {
    if(books[isbn])
    {
      resolve(books[isbn]);
    }
    else {
      reject("No book found with this ISBN");
    }
  });

  getBookByISBN
  .then(response => res.json(response))
  .catch(error => res.status(404).json({message : error}));
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  async function getBookByAuthor()
  {
    let filterd_books = [];
    for(let key in books)
    {
      const book = books[key];
      if(book.author.toLowerCase() === req.params.author.toLowerCase()){
        filterd_books.push(book);
      }
    }
    if(filterd_books.length > 0) return filterd_books;
    else throw new Error("No book found!");
  }

  try{
    const filterd_books = await getBookByAuthor();
    res.json(filterd_books);
  }
  catch(error)
  {
    res.json({message : error.message});
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  async function getBooksByTitle()
  {
    try{
    const response = await axios.get("http://localhost:5000");
    return response.data;
    }
    catch(error)
    {
      throw new Error(error);
    }
  }
  try {
    let filterd_books = [];
  const response = await getBooksByTitle();
  const title = req.params.title;

  for(let key in response)
  {
    const book = response[key];
    if(book.title.toLowerCase() === title.toLowerCase()){
      filterd_books.push(book);
    }
  }
  if(filterd_books.length > 0) res.status(200).json(filterd_books);
  else res.status(404).json({message : "No book found with this title"});
}
catch(error)
{
  res.status(404).json({message : error.message});
}
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book) {
  const reviews = book.reviews;
    res.send(reviews);
  }
else{
  res.send("No book available with this ISBN");
}
});

module.exports.general = public_users;
