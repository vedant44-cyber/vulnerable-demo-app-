#  Vulnerable Demo App






### 1. Clone the Repository
```bash
git clone https://github.com/vedant44-cyber/vulnerable-demo-app-.git
cd vulnerable-demo-app

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Run the App

```bash
node vulnerable-server.js

```

The server will start on **http://localhost:4000**.






---


### Dynamic Analysis (DAST)

1. Expose the app to the internet for better header testing:
```bash
ngrok http 4000

```


2. In the dashboard, enter the local URL `http://localhost:4000` (or your ngrok URL).
3. Click **"Run Dynamic Scan"**.

---
