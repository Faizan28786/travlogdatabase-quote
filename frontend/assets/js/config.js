// window.CONFIG = {
//     API_BASE: "http://localhost:5000/api/quote-data",
//     HOTEL_API: "http://localhost:5000/api/hotels",
//     EXPORT_API: "http://localhost:5000/api/quote-export",
//     EMAIL_API: "http://localhost:5000/api/email/send"
// };

const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

const CONFIG = {
    API_BASE: isLocal
        ? "http://localhost:5000/api"
        : "https://travlogdatabase-quote.onrender.com/api",

    HOTEL_API: isLocal
        ? "http://localhost:5000/api/hotels"
        : "https://travlogdatabase-quote.onrender.com/api/hotels",

    EXPORT_API: isLocal
        ? "http://localhost:5000/api/quote-export"
        : "https://travlogdatabase-quote.onrender.com/api/quote-export"
};