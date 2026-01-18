const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mysql = require('mysql'); // Mock DB for SQLi demonstration
const app = express();

app.use(express.json());

// RULE VIOLATION: broken-cors
// Triggers: 'Access-Control-Allow-Origin' set to '*' or 'origin: "*"'

app.use(cors({
    origin: "*", 
    credentials: true // Makes it critical severity
}));

// RULE VIOLATION: exposed-secrets
// Triggers: Regex matches for AWS, Google, and Generic keys
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"; // Matches AKIA + 16 chars
const GOOGLE_API_KEY = "AIzaSyD-1234567890abcdefghijklmnopqr_"; // Matches AIza + 35 chars
const STRIPE_API_KEY = "api_key = 'sk_live_51H0js1234567890abcdefghijklmnopq'"; // Matches generic pattern

// Mock DB connection
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '' });


// RULE VIOLATION: jwt-misconfiguration
// Triggers: 'alg: "none"' and weak/hardcoded secrets
app.post('/auth/login', (req, res) => {
    const user = { id: 1, role: 'user' };

    // 1. None Algorithm
    const tokenNone = jwt.sign(user, null, { algorithm: 'none' });

    // 2. Weak Hardcoded Secret (< 32 chars)
    const tokenWeak = jwt.sign(user, "supersecret"); 

    res.json({ tokenNone, tokenWeak });
});


// RULE VIOLATION: sql-injection
// Triggers: String concatenation or template literals in DB calls
app.get('/products', (req, res) => {
    const category = req.query.category;

    // Dangerous: String concatenation
    db.query("SELECT * FROM products WHERE category = " + category, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.post('/users/search', (req, res) => {
    const name = req.body.name;

    // Dangerous: Template literal with expression
    db.execute(`SELECT * FROM users WHERE name LIKE '${name}'`);
});


// RULE VIOLATION: dangerous-eval
// Triggers: eval(), new Function(), setTimeout with string
app.post('/admin/calc', (req, res) => {
    const formula = req.body.formula;

    // Dangerous: Executing arbitrary code
    const result = eval(formula);

    // Dangerous: Timer with string argument
    setTimeout("console.log('Calculation finished for ' + " + formula + ")", 1000);

    // Dangerous: Function constructor
    const func = new Function(formula);
    
    res.json({ result });
});


// RULE VIOLATION: unsafe-object-access
// Triggers: Dynamic assignment with untrusted input (req.body)
app.post('/api/settings', (req, res) => {
    const config = {};
    const userInput = req.body;

    // Object.assign with untrusted source
    Object.assign(config, userInput);

    //  Dynamic property assignment (Prototype Pollution)
    config[req.body.key] = req.body.value;

    //  Direct dangerous property access
    if (userInput['__proto__']) {
        console.log("Attempted pollution");
    }

    res.json(config);
});


// RULE VIOLATION: security-headers (Dynamic)
// Triggers: Missing X-Frame-Options, CSP, etc. when scanned live

app.get('/', (req, res) => {
    // Express by default does NOT set Content-Security-Policy or X-Frame-Options
    // This will trigger the dynamic scanner.
    res.send('<h1>Vulnerable App</h1>');
});

app.listen(4000, () => {
    console.log('Vulnerable app running on http://localhost:4000');
});