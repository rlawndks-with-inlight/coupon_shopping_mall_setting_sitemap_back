import { pool } from "../../config/db.js";
import { returnMoment } from "../function.js";
import fs from "fs";
import { NodeSSH } from 'node-ssh'
import 'dotenv/config';

const ssh2 = new NodeSSH();

const updateSiteMap = async () => {
  try {
    const sshConn = await ssh2.connect({
      host: process.env.HOST,
      username: 'root',
      port: '22',
      password: process.env.DB_PASSWORD,
      readyTimeout: 1800
    });

    let brands = await pool.query(`SELECT * FROM brands WHERE is_delete=0`);
    brands = brands?.result;

    let posts = await pool.query(`SELECT posts.id, posts.category_id, post_categories.brand_id FROM posts LEFT JOIN post_categories ON posts.category_id=post_categories.id WHERE posts.is_delete=0 `);
    posts = posts?.result;
    let products = await pool.query(`SELECT id, brand_id FROM products WHERE products.is_delete=0 `);
    products = products?.result;
    let date = returnMoment().substring(0, 10);

    for (var i = 0; i < brands.length; i++) {
      let brand = brands[i];
      let url = `https://${brand?.dns}`;
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
      sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;
      sitemap += `<url><loc>${url}</loc><lastmod>${date}</lastmod>\n</url>\n`;
      let product_list = products.filter(item => item?.brand_id == brand?.id);
      let post_list = posts.filter(item => item?.brand_id == brand?.id);
      console.log(product_list)
      console.log(post_list)
      for (var j = 0; j < product_list.length; j++) {
        sitemap += `<url><loc>${url}/shop/item/${product_list[j]?.id}</loc><lastmod>${date}</lastmod>\n</url>\n`;
      }
      for (var j = 0; j < post_list.length; j++) {
        sitemap += `<url><loc>${url}/shop/service/${post_list[j]?.category_id}/${post_list[j]?.id}</loc><lastmod>${date}</lastmod>\n</url>\n`;
      }
      sitemap += `</urlset>`;
      fs.writeFileSync(
        `/root/front/public/sitemap-${brand?.id}.xml`,
        sitemap,
        "utf8",
        function (error) {
          console.log("write end");
        }
      );
    }
    let setting = await sshConn.execCommand(`cd /root/front && npm run deploy`,);
  } catch (err) {
    console.log(err);
  }
};

export default updateSiteMap;
