// controllers/PermissionController.js
import Permission from '../models/UserPermission.js';

const createPermission = async (req, res) => {
    try {
      const { name, description } = req.body;
  
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }
  
      const permission = new Permission({ name, description });
      await permission.save();
  
      return res.status(201).json({ success: true, message: 'Permission created successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

  export {createPermission}