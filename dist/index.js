"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var Server = /** @class */ (function () {
    function Server() {
        this.app = (0, express_1.default)();
        this.PORT = Number(process.env.PORT) || 5000;
        this.configureMiddleware();
        this.start();
    }
    Server.prototype.configureMiddleware = function () {
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(express_1.default.json());
        this.app.use(function (req, res, next) {
            console.log("Path ".concat(req.path, " with Method ").concat(req.method));
            next();
        });
    };
    Server.prototype.start = function () {
        var _this = this;
        this.app.listen(this.PORT, function () {
            console.log("Server is up and running at ".concat(_this.PORT));
        });
    };
    return Server;
}());
var server = new Server();
