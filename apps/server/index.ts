'use strict';
import express, {Express} from 'express';
import bodyParser from 'body-parser';
import {FirestoreService} from "./firestore.service";
import cors from 'cors'
import WebhookService from "./webhook.service";
import ClientService from "./client.service";
import AdminService from "./admin.service";
import ActivityService from "./activity.service";
import CardService from "./card.service";
import ImageService from "./images.service";
import AthleteService from "./athlete.service";
import GameService from "./game.service";
import LoggerService from "./logger.service";
import AchievementService from "./achievement.service";
import AuthService from "./auth.service";
import {Logger} from "winston";
import {AuthInterceptor} from "./helpers/auth.interceptor";

const app: Express = express().use(
    bodyParser.json(),
    AuthInterceptor.interceptRequest,
    cors({
        exposedHeaders: 'Refreshed-Jwt'
    })
);
const logger: Logger = LoggerService.init(app);
const fireStoreService = new FirestoreService(logger);
const webhookService = new WebhookService(app, fireStoreService);
const clientService = new ClientService(app, fireStoreService);
const adminService = new AdminService(app, fireStoreService, logger);
const cardService = new CardService(app, fireStoreService, logger);
const activityService = new ActivityService(app, fireStoreService, logger, cardService);
const imageService = new ImageService(app, fireStoreService);
const athleteService = new AthleteService(app, fireStoreService, logger);
const gameService = new GameService(app, fireStoreService);
const achievementService = new AchievementService(app, fireStoreService);
const authService = new AuthService(app, fireStoreService, logger, athleteService);

