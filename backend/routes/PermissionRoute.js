// routes/PermissionRoute.js
import express from 'express'
import { createPermission } from '../controllers/PermissionController.js';

const PermissionRouter = express.Router();

// ...

PermissionRouter.post('/create', createPermission);

export default PermissionRouter;