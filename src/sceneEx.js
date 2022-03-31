const { Telegraf, session, Scenes: { BaseScene, Stage }, Markup } = require('telegraf');
const botToken = '5150454115:AAFRQflmTa9Fsrtk58Zj-6KG9VAI2CAt4Mw';

const exitKeyboard = Markup.keyboard([ 'exit'] ).oneTime();
const removeKeyboard = Markup.removeKeyboard();

// name Scene:
const nameScene = new BaseScene('nameScene');

nameScene.enter(ctx => {
    console.log('enter nameScene');
    ctx.reply('What is your name?', exitKeyboard);
});

nameScene.on('text', ctx => {
    return ctx.scene.enter('ageScene', { name: ctx.message.text, ad: 33 });
});

nameScene.leave(ctx => ctx.reply('Leaving name scene'));

// age Scene:
const ageScene = new BaseScene('ageScene');

ageScene.enter(ctx => ctx.reply('How old are you?'), exitKeyboard);

ageScene.on('text', ctx => {
    ctx.session.age = parseInt(ctx.message.text);
    ctx.session.name = ctx.scene.state.name;
    ctx.session.ad = ctx.scene.state.ad;
    ctx.reply('New info has been sent', removeKeyboard);
    return ctx.scene.leave();
});

ageScene.leave(ctx => ctx.reply('Leaving age scene'));

// stages definition:
const stage = new Stage([ nameScene, ageScene ]);
stage.hears('exit', ctx => ctx.scene.leave());

// bot:
console.log('start!');
const bot = new Telegraf(botToken);
bot.use(session());
bot.use(stage.middleware());

bot.command('/start', ctx => ctx.reply(`${ctx.session.ad}\nYour name is ${ctx.session.name}\nYour age is ${ctx.session.age}`));
bot.command('/info', ctx => ctx.scene.enter('nameScene'));
bot.launch();