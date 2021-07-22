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


// creates express http server
const app = express().use(bodyParser.json(), cors());
const fireStoreService = new FirestoreService()
const webhookService = new WebhookService(app, fireStoreService);
const clientService = new ClientService(app, fireStoreService);
const adminService = new AdminService(app, fireStoreService);
const deckService = new DeckService(app, fireStoreService);
const activityService = new ActivityService(app, fireStoreService);
const cardService = new CardService(app, fireStoreService);
const imageService = new ImageService(app, fireStoreService);

