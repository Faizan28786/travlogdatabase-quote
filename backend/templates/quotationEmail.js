exports.quotationEmailTemplate = (quotationHTML) => {
    return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">

<style>

body{
    margin:0;
    padding:30px;
    background:#f3f6fb;
    font-family:Arial,sans-serif;
}

.wrapper{
    max-width:900px;
    margin:auto;
    background:#ffffff;
    border-radius:10px;
    overflow:hidden;
    box-shadow:0 0 20px rgba(0,0,0,.08);
}

.header{
    background:#ffffff;
    border-bottom:3px solid #1d4ed8;
    padding:20px;
}

.logo{
    width:130px;
}

.content{
    padding:30px;
}

.footer{
    padding:20px;
    text-align:center;
    font-size:12px;
    color:#777;
    border-top:1px solid #eee;
}

table{
    border-collapse:collapse;
}

</style>

</head>

<body>

<div class="wrapper">

<div class="header">

</div>

<div class="content">

${quotationHTML}

</div>

<div class="footer">

TravLog B2B Travel Partner

</div>

</div>

</body>

</html>
`;
};