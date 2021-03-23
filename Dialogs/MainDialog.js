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
const { Channels, ActivityTypes } = require('botbuilder-core');

//NLP as a service WIT
const {Wit, log} = require('node-wit');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');

//Scrappers
// const Scrapper = require('../scarppers/wiki');


// const { UserProfile } = require('../userProfile');
const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
// const USER_PROFILE = 'USER_PROFILE';


//Dialogs
const MAIN_WATERFALL_DIALOG = 'MAIN_WATERFALL_DIALOG';
const WHOIS_WATERFALL_DIALOG = 'WHOIS_WATERFALL_DIALOG';


// const FreeDialog = require('./FreeDialog');
const { WhoIsDialog } = require('./Intent/WhoIsDialog');

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
            this.QueryStep.bind(this),
            this.SwitchDialogStep.bind(this)
        ]));

        this.addDialog(new WhoIsDialog(WHOIS_WATERFALL_DIALOG));

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
        await step.context.sendActivity({type: ActivityTypes.Typing});
        [step.values.intent, step.values.entity] = await client.message(step.values.query, {
        }).then((data) => {
            if(data["entities"]["intent"][0]["value"] !== undefined) return [data["entities"]["intent"][0]["value"], data["entities"]["name_of_person"][0]["value"]];
            else return [null, null];
        }).catch(err => {
            return "intnet was not found"
        }); 
        console.log("step.values.intent : " + step.values.intent)
        console.log("step.values.entity : " + step.values.entity)
        return await step.next(1);
    }

    async SwitchDialogStep(step){
        console.log("Intent was :" + step.values.intent);
        switch(step.values.intent){
            case 'wit_person_search' : 
                return await step.beginDialog(WHOIS_WATERFALL_DIALOG, step.values.entity);
        }
        return await step.context.sendActivity("no intent found");
    }

    
}


module.exports.MainDialog = MainDialog;