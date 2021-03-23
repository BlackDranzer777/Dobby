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


//Scrappers
const Scrapper = require('../../scarppers/wiki');

//Prompts
const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

//Dialogs
const MAIN_WATERFALL_DIALOG = 'MAIN_WATERFALL_DIALOG';
const WHOIS_WATERFALL_DIALOG = 'WHOIS_WATERFALL_DIALOG';


class WhoIsDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        // this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));
        this.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT, this.picturePromptValidator));

        this.addDialog(new WaterfallDialog(WHOIS_WATERFALL_DIALOG, [
            this.NameStep.bind(this),
            this.SendResponseStep.bind(this)
        ]));

        this.initialDialogId = WHOIS_WATERFALL_DIALOG;
    }


    async NameStep(step) {
        console.log("WhoIsDialog started");
        step.values.entity = step._info.options; 
        step.values.response = await Scrapper.WikiScrapper(step.values.entity).then(result => {
            console.log("Result is this : " + result);
            if(result != undefined) return result;
            else return "Sorry no person found by this name.";
        }).catch(err => {
            return console.log(err);
        });
        return await step.next(1);
    }

    async SendResponseStep(step){
        return await step.context.sendActivity(step.values.response);
    }

    
}


module.exports.WhoIsDialog = WhoIsDialog;