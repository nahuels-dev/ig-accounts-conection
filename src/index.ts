import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

class Server {
  private app: Express;
  private PORT: number;

  constructor() {
    this.app = express();
    this.PORT = Number(process.env.PORT) || 5000;
    this.configureMiddleware();
    this.start();
  }

  private configureMiddleware(): void {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use((req: Request, res: Response, next) => {
      console.log(`${req.path} ${req.method}`);
      next();
    });
  }

  private start(): void {
    this.app.listen(this.PORT, () => {
      console.log(`Server at ${this.PORT}`);
    });
  }

  private searchByScope(data:any,scope:string){
    const granularScopes = data.data.granular_scopes;

  for (const object of granularScopes) {
    if (object.scope === scope) {
      return object;
    }
  }

  return null;
  }
}

const server = new Server();
