const express = require("express");
const { pool } = require("./db");
const app = express();
const PORT = 8080;
const path = require("path");
const multer = require("multer");
const cors = require('cors');
const morgan = require('morgan');
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use("/static", express.static('public'));

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, done) => {
            done(null, "public/");
        },
        filename: (req, file, done) => {
            const ext = path.extname(file.originalname);
            const fileNameExeptExt = path.basename(file.originalname, ext);
            const saveFileName = fileNameExeptExt + Date.now() + ext;
            done(null, saveFileName);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});

app.get("/api/menus", async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM menus");

        return res.json(data[0]);
    }
    catch (err) {
        return res.json({
            success: false,
            message: "전체 메뉴 목록 조회 실패"
        });
    }
})

app.get("/api/menus/:id", async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM menus WHERE id = ?", [req.params.id]);

        return res.json(data[0][0]);
    }
    catch (err) {
        return res.json({
            success: false,
            message: "메뉴 조회 실패"
        });
    }
})

app.post('/api/menus', upload.single('file'), async (req, res) => {
    try {
        const data = await pool.query(`INSERT INTO menus (name, description, image_src) VALUES (?, ?, ?)`, [req.body.name, req.body.description, req.file.path]);

        return res.json({
            success: true,
            message: "메뉴 등록 성공"
        });
    }
    catch (err) {
        return res.json({
            error: err,
            success: false,
            message: "메뉴 등록 실패"
        });
    }
})

app.patch('/api/menus/:id', async (req, res) => {
    try {
        const data = await pool.query(`UPDATE menus SET name = ?, description = ? WHERE id = ?`, [req.body.name, req.body.description, req.params.id]);

        return res.json({
            success: true,
            message: "메뉴 정보 수정 성공"
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: "메뉴 정보 수정 실패"
        });
    }
})

app.post('/api/menus/:id', upload.single('file'), async (req, res) => {
    try {
        const data = await pool.query(`UPDATE menus SET image_src = ? WHERE id = ?`, [req.file.path, req.params.id]);

        return res.json({
            success: true,
            message: "메뉴 이미지 수정 성공"
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: "메뉴 이미지 수정 실패"
        });
    }
})

app.delete('/api/menus/:id', async (req, res) => {
    try {
        const data = await pool.query(`DELETE FROM menus WHERE id = ?`, [req.params.id]);

        return res.json({
            success: true,
            message: "메뉴 삭제 성공"
        })
    }
    catch (err) {
        return res.json({
            success: false,
            message: "메뉴 삭제 실패"
        })
    }
})

app.get('/api/orders', async (req, res) => {
    try {
        const data = await pool.query(`
        SELECT a.id, quantity, request_detail, name, description
        FROM orders as a
        INNER JOIN menus as b
        ON a.menus_id = b.id
        ORDER BY a.id DESC
        `);

        return res.json(data[0]);
    }
    catch (err) {
        return res.json({
            success: false,
            message: "전체 주문 목록 조회 실패"
        })
    }
})

app.post('/api/orders', async (req, res) => {
    try {
        const data = await pool.query(`INSERT INTO orders (quantity, request_detail, menus_id) VALUES (?, ?, ?)`, [req.body.quantity, req.body.request_detail, req.body.menus_id]);

        return res.json({
            success: true,
            message: "주문 성공"
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: "주문 실패"
        });
    }
})

app.get('/api/orders/:id', async (req, res) => {
    try {
        const data = await pool.query(`
        SELECT a.id, quantity, request_detail, name, description
        FROM orders as a
        INNER JOIN menus as b
        ON a.menus_id = b.id
        WHERE a.id = ?`, [req.params.id]);

        return res.json(result[0]);
    }
    catch (err) {
        return res.json({
            success: false,
            message: "주문내역 조회 실패"
        });
    }
})

app.patch('/api/orders/:id', async (req, res) => {
    try {
        const data = await pool.query(`UPDATE orders SET quantity = ?, request_detail = ?, menus_id = ? WHERE id = ?`, [req.body.quantity, req.body.request_detail, req.body.menus_id, req.params.id]);

        return res.json({
            success: true,
            message: "주문수정 성공"
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: "주문수정 실패"
        });
    }
})

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const data = await pool.query(`DELETE FROM orders WHERE id = ?`, [req.params.id]);

        return res.json({
            success: true,
            message: "주문삭제 성공"
        });
    }
    catch (err) {
        return res.json({
            err:err,
            success: false,
            message: "주문삭제 실패"
        });
    }
})

app.listen(PORT, () => console.log(`this server listening on ${PORT}`));