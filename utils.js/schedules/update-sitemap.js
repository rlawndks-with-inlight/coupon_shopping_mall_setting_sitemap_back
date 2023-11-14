import { pool } from "../../config/db.js";
import { returnMoment } from "../function.js";
import fs from "fs";

const updateSiteMap = async () => {
  let brands = await pool.query(`SELECT * FROM brands`);
  brands = brands?.result;
  let date = returnMoment().substring(0, 10);

  for (var i = 0; i < brands.length; i++) {
    let brand = brands[i];
    let url = `https://${brand?.dns}`;
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;
    sitemap += `<url><loc>${url}</loc><lastmod>${date}</lastmod>\n</url>\n`;
    sitemap += `</urlset>`;
    fs.writeFileSync(
      `../../front/public/sitemap-${brand?.id}.xml`,
      data,
      "utf8",
      function (error) {
        console.log("write end");
      }
    );
  }
};

export default updateSiteMap;
