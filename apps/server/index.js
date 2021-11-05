'use strict';
import express from 'express';
import bodyParser from 'body-parser';
import {FirestoreService} from "./firestore.service.js";
import cors from 'cors'
import WebhookService from "./webhook.service.js";
import ClientService from "./client.service.js";
import AdminService from "./admin.service.js";
import DeckService from "./deck.service.js";
import ActivityService from "./activity.service.js";
import CardService from "./card.service.js";
import ImageService from "./images.service.js";
import AthleteService from "./athlete.service.js";
import GameService from "./game.service.js";
import LoggerService from "./logger.service.js";

const app = express().use(bodyParser.json(), cors());
const logger = new LoggerService(app);
const fireStoreService = new FirestoreService(logger);
const webhookService = new WebhookService(app, fireStoreService);
const clientService = new ClientService(app, fireStoreService);
const adminService = new AdminService(app, fireStoreService);
const deckService = new DeckService(app, fireStoreService);
const activityService = new ActivityService(app, fireStoreService);
const cardService = new CardService(app, fireStoreService);
const imageService = new ImageService(app, fireStoreService);
const athleteService = new AthleteService(app, fireStoreService);
const gameService = new GameService(app, fireStoreService);

