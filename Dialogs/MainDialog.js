//PATH
const path = require('path');
//ENV
const dotenv = require('dotenv');
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { MessageFactory } = require('botbuilder');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { Channels } = require('botbuilder-core');

//NLP as a service WIT
const {Wit, log} = require('node-wit');


// const { UserProfile } = require('../userProfile');
const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
// const USER_PROFILE = 'USER_PROFILE';
const MAIN_WATERFALL_DIALOG = 'MAIN_WATERFALL_DIALOG';

//Dialogs
// const FreeDialog = require('./FreeDialog');

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super('MainDialog');

        // this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));
        this.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT, this.picturePromptValidator));

        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.QueryStep.bind(this)
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async QueryStep(step) {
        const client = new Wit({accessToken: process.env.WitAccessToken});
        step.values.query = step.context.activity.text;
        return await client.message(step.values.query, {
        }).then((data) => {
            console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
            return step.context.sendActivity("your intent is this : " + data["intents"][0]["name"]);
        }).catch(err => {
            return console.error
        });
        
    }
}

module.exports.MainDialog = MainDialog;