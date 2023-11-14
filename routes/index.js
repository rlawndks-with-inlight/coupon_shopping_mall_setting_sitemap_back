import express from "express";
import { NodeSSH } from 'node-ssh'
import 'dotenv/config';
import { pool } from "../config/db.js";
const router = express.Router(); // eslint-disable-line new-cap
const ssh2 = new NodeSSH();


const settingBrandLinux = async (req, res, next) => {
    try {
        const sshConn = ssh2.connect({
            host: process.env.DB_HOST,
            username: 'root',
            port: '22',
            password: process.env.DB_PASSWORD,
            readyTimeout: 1800
        });
        const {
            brand_id,
        } = req.body;
        let brand = await pool.query('SELECT * FROM brands WHERE id=?', [brand_id]);
        brand = brand?.result[0];
        let result = await ss
    } catch (err) {

    }
};

router.post("/setting-linux", settingBrandLinux);
export default router;
