const maxLength = 4000;
const minLength = 3200;

async function send(ctx, message, markup) {
    if (message.length === 0) console.error('! Error: cannot send blank message !');

    let start = 0;
    let end = 0;

    while (end !== message.length) {
        let extraLength = message.substring(
            Math.min(start + minLength, message.length),
            Math.min(start + maxLength, message.length)
        ).lastIndexOf('\n');

        if (extraLength === -1) end = start + maxLength;
        else end = start + minLength + extraLength;
        end = Math.min(end,message.length);

        try {
            await ctx.replyWithHTML(message.substring(start, end), markup);
        } catch (error) {
            await ctx.replyWithHTML(message.substring(start, end));
        }

        start = end;
    }
}

module.exports = send;