const mongoose = require("mongoose");

mongoose.connect(
"mongodb+srv://write2faizan28_db_user:travlog2026@travlog.plbirhr.mongodb.net/?retryWrites=true&w=majority&appName=travlog"
)
.then(() => {
    console.log("CONNECTED");
})
.catch(err => {
    console.log(err);
});