import DB from "./data/db.json";
import { apiServer } from "./src/api";
import { CityDatabase } from "./src/cities/types";

// globals
const PORT = process.env.PORT || 2345;
const ADDRESS = process.env.URL || "0.0.0.0";

// bootstrap the server
const API = apiServer(DB as CityDatabase);
API.listen(PORT, ADDRESS, () => {
  console.log("server listening in ", `${ADDRESS}:${PORT}`);
});

module.exports = API;
