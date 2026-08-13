const xlsx = require('xlsx');
const fs = require('fs');

const file = 'Docs/Requested Etransfers with 3 emails.xlsx';
const workbook = xlsx.readFile(file);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log("Columns:", Object.keys(data[0] || {}));

const emailCol = Object.keys(data[0]).find(k => k.toLowerCase().includes('email'));
if (emailCol) {
    const uniqueEmails = [...new Set(data.map(row => row[emailCol]).filter(Boolean))];
    console.log("Unique Emails:", uniqueEmails.slice(0, 10)); // just in case there are many
} else {
    console.log("Email column not found");
}

console.log("\nSample rows:");
console.log(JSON.stringify(data.slice(0, 5), null, 2));
