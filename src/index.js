import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: "./env" });
connectDB();

// this below commented can be used if we want to connect the db from index file
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("error", error);
//       throw error;
//     });
//   } catch (error) {
//     console.log("ERROR : ", error);
//     throw error;
//   }
// })();
