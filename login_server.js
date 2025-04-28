// login-server.js
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // 개발용. 운영환경에서는 secure: true (HTTPS)
    }),
);

// 로그인 폼 페이지
app.get("/login", (req, res) => {
    if (req.session.user) {
        // 이미 로그인한 사람은 프로필로
        return res.redirect("/profile");
    }

    res.send(`
        <html>
          <head><title>로그인</title></head>
          <body>
            <h2>로그인</h2>
            <form method="POST" action="/login">
              <input type="text" name="username" placeholder="아이디" required/><br/><br/>
              <input type="password" name="password" placeholder="비밀번호" required/><br/><br/>
              <button type="submit">로그인</button>
            </form>
          </body>
        </html>
    `);
});

// [4] 로그인 처리 (POST /login)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "testuser" && password === "testpass") {
        req.session.user = { username };

        // ✅ 로그인 성공 시 myapp://loginSuccess?username=testuser 로 리다이렉트
        const userInfo = {
            username: req.session.user.username,
        };
        const userInfoEncoded = encodeURIComponent(JSON.stringify(userInfo));
        res.redirect(`myapp://loginSuccess?user=${userInfoEncoded}`);
    } else {
        // 로그인 실패
        res.send(`
            <html>
              <head><title>로그인 실패</title></head>
              <body>
                <h2>로그인 실패! 다시 시도하세요.</h2>
                <form method="POST" action="/login">
                  <input type="text" name="username" placeholder="아이디" required/><br/><br/>
                  <input type="password" name="password" placeholder="비밀번호" required/><br/><br/>
                  <button type="submit">로그인</button>
                </form>
              </body>
            </html>
        `);
    }
});

// 로그인된 사용자 확인
app.get("/profile", (req, res) => {
    if (req.session.user) {
        res.send(`
            <h2>안녕하세요, ${req.session.user.username}님!</h2>
            <form action="/logout" method="GET">
                <button type="submit">로그아웃</button>
            </form>
        `);
    } else {
        res.redirect("/login");
    }
});

// [6] 로그아웃 처리
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        // 세션 삭제
        if (err) {
            console.log("세션 삭제 실패:", err);
            res.status(500).send("로그아웃 실패");
        } else {
            res.redirect("/login"); // 로그아웃 성공 후 로그인 페이지로 이동
        }
    });
});

// [0] 루트 URL 접근 시 /login으로 이동
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.listen(port, () => {
    console.log(`Login server running at http://localhost:${port}`);
});
