import schedule from "node-schedule";
import { returnMoment } from "../function.js";
import updateSiteMap from "./update-sitemap.js";

const scheduleIndex = () => {
  schedule.scheduleJob("0 0/1 * * * *", async function () {
    let return_moment = returnMoment();
    if (return_moment.includes("00:00:")) {
      updateSiteMap();
    }
  });
};

export default scheduleIndex;
