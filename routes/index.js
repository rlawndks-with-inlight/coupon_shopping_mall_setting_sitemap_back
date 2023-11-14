import express from "express";
import { NodeSSH } from 'node-ssh'
import 'dotenv/config';
import { pool } from "../config/db.js";
import fs from "fs";
import { response } from "../utils.js/util.js";

const router = express.Router(); // eslint-disable-line new-cap
const ssh2 = new NodeSSH();

const settingBrandLinux = async (req, res, next) => {
    try {
        const sshConn = await ssh2.connect({
            host: process.env.HOST,
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

        let nginx_text = `
        server {
            listen 80;
            server_name ${brand?.dns}
            root html;
            
            
            location / {
                    return 301 https://${brand?.dns}$request_uri;
                }
            }
            
            server {
            
                listen       443 ssl;
                server_name  ${brand?.dns};
                
                client_max_body_size 256M;
                
                ssl_certificate     /etc/letsencrypt/live/${brand?.dns}/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/${brand?.dns}/privkey.pem;
            
                location / {
                   proxy_pass http://${brand?.dns}:3000;
            
                }
             
                location = /50x.html {
                    root   /usr/share/nginx/html;
                }
            }   
        `
        let wirte_nginx_setting = await fs.writeFileSync(
            `/etc/nginx/sites-enabled/${brand?.dns}`,
            nginx_text,
            "utf8",
            function (error) {
                console.log("write end");
            }
        );
        let setting_ssl = await sshConn.execCommand(`sudo certbot --nginx -d ${brand?.dns}`,);
        let nginx_start = await sshConn.execCommand(`service nginx restart`,);
        return response(req, res, 100, "success", {});

    } catch (err) {
        console.log(err)
        return response(req, res, -200, "서버 에러 발생", false)
    }
};
const getSettingCheckList = async (req, res, next) => {
    try {
        let brands = await pool.query('SELECT * FROM brands');
        brands = brands?.result;
        let letsencrypt_files = fs.readdirSync('/etc/letsencrypt/live');
        let nginx_files = fs.readdirSync('/etc/nginx/sites-enabled');

        return response(req, res, 100, "success", {
            letsencrypt_files,
            nginx_files,
        });
    } catch (err) {
        console.log(err)
        return response(req, res, -200, "서버 에러 발생", false)
    }
}
router.post("/setting-linux", settingBrandLinux);
router.get("/setting-check-list", getSettingCheckList);
export default router;
