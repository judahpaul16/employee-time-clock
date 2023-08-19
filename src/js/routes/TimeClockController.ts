import { Request, Response, Router } from 'express';
import { Employee } from '../models/Employee';

class TimeClockController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post('/clock-in', this.clockIn);
        this.router.post('/clock-out', this.clockOut);
    }

    private clockIn = (req: Request, res: Response) => {
        const employee = new Employee(req.body.id);
        employee.clockIn();
        res.status(200).json({ message: 'Clocked in successfully' });
    };

    private clockOut = (req: Request, res: Response) => {
        const employee = new Employee(req.body.id);
        employee.clockOut();
        res.status(200).json({ message: 'Clocked out successfully' });
    };
}

export default new TimeClockController().router;
