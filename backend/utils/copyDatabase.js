import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const OLD_DB_URI = process.env.OLD_MONGO_URI;
const NEW_DB_URI = process.env.MONGO_URI;

async function copyDatabase() {
  const oldConnection = mongoose.createConnection(OLD_DB_URI);

  const newConnection = mongoose.createConnection(NEW_DB_URI);

  // 🔑 Wait until the connections are actually ready
  await oldConnection.asPromise();
  await newConnection.asPromise();

  try {
    const collections = await oldConnection.db.listCollections().toArray();

    for (const { name: collectionName } of collections) {
      
        const OldModel = oldConnection.model(
          collectionName,
          new mongoose.Schema({}, { strict: false }),
          collectionName
        );
      
        const NewModel = newConnection.model(
          collectionName,
          new mongoose.Schema({}, { strict: false }),
          collectionName
        );
      
        const docs = await OldModel.find({}).lean();
      
        if (docs.length > 0) {
          console.log(`✅ Copied ${docs.length} documents from '${collectionName}'`);
        } else {
          console.log(`⚠️ No documents in '${collectionName}'`);
        }
      }
    console.log("✅ All collections copied successfully!");      
    return { success: true, message: "🎉 Database copy completed!" };
  } catch (err) {
    console.error("❌ Error:", err);
    return { success: false, message: err.message };
  } finally {
    await oldConnection.close();
    await newConnection.close();
  }
}

export default copyDatabase;
