// models/Permission.js
import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;