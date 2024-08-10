//we will list all the possible events/actions that can be triggered in our app in this file
//we will use these actions to update our state
//these actions will be triggered by the socket events

const ACTIONS = {
    JOIN: 'join',                       //to join
    JOINED: 'joined',                   //has joined
    DISCONNECTED: 'disconnected',
    CODE_CHANGE: 'code-change',
    SYNC_CODE: 'sync-code',
    LANGUAGE_CHANGE: 'language-change',
    OUTPUT_CHANGE: 'output-change',
    LEAVE: 'leave', 
};

module.exports = ACTIONS;