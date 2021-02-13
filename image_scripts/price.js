const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');
const axios = require('axios');

const js_helper = require('../helpers/js.js');

const UPCOLOR = '#16c784';
const DOWNCOLOR = '#ea3943';
const NOCHANGECOLOR = '#000000';

exports.create = async function(fname) {

    const height = 512;
    const width = 512;
    const frames = 100;

    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream(fname));

    encoder.start();
    encoder.setRepeat(0);       // 0 for repeat, -1 for no-repeat
    encoder.setDelay(1000/30);  // frame delay in ms
    encoder.setQuality(10);     // image quality. 10 is default.

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const price = (await axios.get('https://node.somenano.com/proxy?action=price')).data;
    // console.log(price);

    let bg = await loadImage('./public/images/stock/price-bg.svg');
    let rocket = [
        await loadImage('./public/images/stock/rocket-1.png'),
        await loadImage('./public/images/stock/rocket-2.png')
    ];

    // Rocket
    const price_change = price.quotes.USD.percent_change_7d;

    const animation_margin_y = rocket[0].height*1.5;
    const animation_margin_x = rocket[0].width*1.5;
    const animation_height = height + 2*animation_margin_y;
    const animation_width = width + 2*animation_margin_x;
    
    let start_x = 0;
    let start_y = animation_height;
    let end_x = animation_width;
    let end_y = 0;

    const max_change = 100;
    const min_change = -1 * (max_change / 2);
    if (price_change > max_change/2) {
        start_x = (animation_width/2) * ((price_change - max_change/2) / (max_change/2));
        if (start_x > animation_width/2) start_x = animation_width/2;
        end_x = animation_width - start_x;
    }

    if (price_change < max_change/2) {
        start_y = (animation_height) * (price_change - min_change) / (max_change/2 - min_change);
        end_y = animation_height - start_y;
    }

    start_x -= animation_margin_x;
    end_x -= animation_margin_x;
    start_y -= animation_margin_y;
    end_y -= animation_margin_y;

    for (let frame=0; frame<frames; frame+=1) {
        // Solid White Background
        ctx.fillStyle='#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Rocket
        let r = rocket[frame%2];
        let coords = js_helper.coord_calc(frame+1, frames, start_x, start_y, end_x, end_y);
        if (coords.angleInRadians < 0) coords.angleInRadians = 0;
        if (coords.angleInRadians > 3*Math.PI / 4) coords.angleInRadians = 3*Math.PI / 4;
        ctx.translate(coords.x, coords.y);
        ctx.rotate(coords.angleInRadians);
        ctx.drawImage(r, -r.width/2, -r.height/2);
        ctx.rotate(-coords.angleInRadians);
        ctx.translate(-coords.x, -coords.y);

        // Transparent layer
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Image Background
        ctx.drawImage(bg, 0, 0);

        // Last Updated
        ctx.font = '12px Montserrat';
        ctx.fillStyle='#000000';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('Updated: '+ new Date(price.last_updated), width/2, 495);

        // Price
        ctx.font = '40px Montserrat';
        ctx.fillStyle='#000000';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('Price: $'+ price.quotes.USD.price.toFixed(2), width/2, 202);

        // 1h
        ctx.font = '20px Montserrat';
        ctx.fillStyle=(price.quotes.USD.percent_change_1h > 0 ? UPCOLOR : (price.quotes.USD.percent_change_1h < 0 ? DOWNCOLOR : NOCHANGECOLOR));
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillText(''+ price.quotes.USD.percent_change_1h +'%', 90, 250);

        // 24h
        ctx.font = '20px Montserrat';
        ctx.fillStyle=(price.quotes.USD.percent_change_24h > 0 ? UPCOLOR : (price.quotes.USD.percent_change_24h < 0 ? DOWNCOLOR : NOCHANGECOLOR));
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillText(''+ price.quotes.USD.percent_change_24h +'%', 237, 250);

        // 7d
        ctx.font = '20px Montserrat';
        ctx.fillStyle=(price.quotes.USD.percent_change_7d > 0 ? UPCOLOR : (price.quotes.USD.percent_change_7d < 0 ? DOWNCOLOR : NOCHANGECOLOR));
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillText(''+ price.quotes.USD.percent_change_7d +'%', 373, 250);

        // 30d
        ctx.font = '20px Montserrat';
        ctx.fillStyle=(price.quotes.USD.percent_change_30d > 0 ? UPCOLOR : (price.quotes.USD.percent_change_30d < 0 ? DOWNCOLOR : NOCHANGECOLOR));
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillText(''+ price.quotes.USD.percent_change_30d +'%', 159, 296);

        // 1y
        ctx.font = '20px Montserrat';
        ctx.fillStyle=(price.quotes.USD.percent_change_1y > 0 ? UPCOLOR : (price.quotes.USD.percent_change_1y < 0 ? DOWNCOLOR : NOCHANGECOLOR));
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillText(''+ price.quotes.USD.percent_change_1y +'%', 303, 296);

        // Volume
        ctx.font = '40px Montserrat';
        ctx.fillStyle='#000000';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('Volume: $'+ (price.quotes.USD.volume_24h/1000000).toFixed(2) +'M', width/2, 370);

        // Volume 24h
        ctx.font = '20px Montserrat';
        ctx.fillStyle=(price.quotes.USD.volume_24h_change_24h > 0 ? UPCOLOR : (price.quotes.USD.volume_24h_change_24h < 0 ? DOWNCOLOR : NOCHANGECOLOR));
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillText(''+ price.quotes.USD.volume_24h_change_24h +'%', 237, 419);

        // Add Frame
        encoder.addFrame(ctx);
    }
    
    encoder.finish();
}