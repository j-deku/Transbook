import express from 'express';
import { registerDevice, removeDevice } from '../controllers/DeviceController.js';

const DeviceRouter = express.Router();

DeviceRouter.post('/', registerDevice);
DeviceRouter.delete('/:token', removeDevice);

export default DeviceRouter;