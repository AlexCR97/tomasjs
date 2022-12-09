import { Request, Response } from "express";

export type ExpressRequestHandler = (req: Request, res: Response) => void | Promise<void>;
