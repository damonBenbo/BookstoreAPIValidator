// Integration test

process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

// sample isbn book
let book_isbn;

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
            '1123112',
            'https://amazon.com/testbook',
            'Harry',
            'Japanese',
            101,
            'New publisher',
            'History of Japan',
            2000)
            RETURNING isbn`);

    book_isbn = result.rows[0].isbn;
});

describe("POST /books", () => {
    test("Creates a new book", async () => {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: '3447323',
                amazon_url: "https://booky.com",
                author: "PoopyOt",
                language: "English",
                pages: 107,
                publisher: "birdhouse",
                title: "The little sea turtle",
                year: 2009
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
    });

    test("Prevents making book without a title", async () => {
        const response = await request(app)
            .post(`/books`)
            .send({ year: 2009 });
        expect(response.statusCode).toBe(400);
    });
});

describe("GET /books", () => {
    test("Gets a list of 1 book", async () => {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
    });
});

describe("GET /books/:isbn", () => {
    test("Gets a single book", async () => {
        const response = await request(app)
            .get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });

    test("Responds with 404 if there is no book", async () => {
        const response = await request(app).get(`/books/999`)
        expect(response.statusCode).toBe(404);
    });
});

