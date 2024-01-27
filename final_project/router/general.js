const Axios = require("axios")
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        const present = users.filter((user) => user.username === username)
        if (present.length === 0) {
            users.push({ "username": req.body.username, "password": req.body.password });
            return res.status(201).json({ message: "USer Created successfully" })
        }
        else {
            return res.status(400).json({ message: "Already exists" })
        }
    }
    else if (!username && !password) {
        return res.status(400).json({ message: "Bad request" })
    }
    else if (!username || !password) {
        return res.status(400).json({ message: "Check username and password" })
    }


});

// Get the book list available in the shop using async await
public_users.get('/', (req, res) => {
    const getBooks = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(books);
            }, 1000);
        })
    }
    getBooks().then((books) => {
        res.json(books);
    }).catch((err) => {
        res.status(500).json({ error: "An error occured" });
    });
});

function getBookByISBN(ISBN) {
    return new Promise((resolve, reject) => {
        try {
            if (books[ISBN]) {
                resolve(books[ISBN]);
            } else {
                reject({ error: "Book not found" });
            }
        } catch (error) {
            reject(error);
        }
    });
}

public_users.get('/isbn/:isbn', async (req, res) => {
    const ISBN = req.params.isbn;

    try {
        const book = await getBookByISBN(ISBN);
        res.json(book);
    } catch (error) {
        res.status(400).json(error);
    }
});


function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        try {
            const bookKeys = Object.keys(books);
            const filteredBooks = bookKeys
                .filter((key) => books[key].author === author)
                .map((key) => books[key]);

            if (filteredBooks.length > 0) {
                resolve(filteredBooks);
            } else {
                reject({ error: "Books not found" });
            }
        } catch (error) {
            reject(error);
        }
    });
}

public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const filteredBooks = await getBooksByAuthor(author);
        sendResponse(res, filteredBooks);
    } catch (error) {
        res.status(400).json(error);
    }
});

function sendResponse(res, data) {
    if (data.length > 0) {
        res.json(data);
    } else {
        res.status(400).json({ error: "Books not found" });
    }
}

function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        try {
            const bookKeys = Object.keys(books);
            const filteredBooks = bookKeys
                .filter((key) => books[key].title === title)
                .map((key) => books[key]);

            if (filteredBooks.length > 0) {
                resolve(filteredBooks);
            } else {
                reject({ error: "Books not found" });
            }
        } catch (error) {
            reject(error);
        }
    });
}

public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const filteredBooks = await getBooksByTitle(title);
        sendResponse(res, filteredBooks);
    } catch (error) {
        res.status(400).json(error);
    }
});

function sendResponse(res, data) {
    if (data.length > 0) {
        res.json(data);
    } else {
        res.status(400).json({ error: "Books not found" });
    }
}


function getBookReviews(isbn) {
    return new Promise((resolve, reject) => {
        try {
            if (books[isbn] && books[isbn].reviews) {
                resolve(books[isbn].reviews);
            } else {
                reject({ error: "Book reviews not found" });
            }
        } catch (error) {
            reject(error);
        }
    });
}

public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const reviews = await getBookReviews(isbn);
        res.json(reviews);
    } catch (error) {
        res.status(400).json(error);
    }
});


module.exports.general = public_users;
