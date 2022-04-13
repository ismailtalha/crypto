const https = require('https');

const inquirer = require('inquirer')
const Excel = require('exceljs')



const readline = require('readline');
const { generateKey } = require('crypto');
const q = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let answers = {
    'opt': '',
    'token': '',
    'date': ''
};
let result = {}
let val;

q.question(`Select Option : 
       1. Portfolio With  No Parameters
       2. Portfolio With a token
       3. Portfolio With a date
       4. Portfolio With date and a token\n`, function (option) {
    console.log('You selected Option : ', option)
    if (option == 1) {

        answers.opt = option;
        getPortfolio()

    }
    else if (option == 2) {
        q.question(`Enter Token\n`, function (token) {
            console.log('You selected Token : ', token)
            answers.opt = option;
            answers.token = token;
            getPortfolio()
        })
    }
    else if (option == 3) {
        q.question(`Enter Timespan\n`, function (date) {
            console.log('You selected Timespan : ', date)
            answers.opt = option;
            answers.date = date;
            getPortfolio()
        })
    }
    else if (option == 4) {
        q.question(`Enter Token\n`, function (token) {
            q.question(`Enter Date\n`, function (date) {
                console.log(`You selected Token : ${token} \n TimeSpan : ${date} `)
                answers.opt = option;
                answers.date = date;
                answers.token = token
                getPortfolio()

            })
        })
    }

});


async function getPortfolio() {
    val = await CurrentUSDRate();
    return await readcsvFile()
}

async function readcsvFile() {
    let file = process.cwd();
    var workbook = new Excel.Workbook();
    workbook.csv.readFile(file + '/alltransaction.csv').then(function () {
        let sheet = workbook.worksheets[0].name;
        var worksheet = workbook.getWorksheet(sheet);
        const style = 'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)';
        console.log('-----------------------------------------');
        console.log('%c Your Portfolio!');
        console.log('-----------------------------------------\n\n');
        console.table(createPortfolio(worksheet, answers.opt, answers.token, answers.date))
    });
};


//Fetch cryptocompare rate from api (https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD)
//#region Fetch cryptocompare API
async function CurrentUSDRate() {
    return new Promise((resolve, rejects) => {
        https.get('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD', res => {
            let data = [];
            res.on('data', chunk => {
                data.push(chunk);
            });
            res.on('end', () => {
                let usdrate = JSON.parse(Buffer.concat(data).toString());
                resolve(usdrate)
            })
        })
    })
}
//#endregion Fetch cryptocompare API




createPortfolio = (worksheet, opt, inputtoken, inputdate) => {

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
        let token = worksheet.findCell(rowNumber, 3).value;
        let timespan = worksheet.findCell(rowNumber, 1).value;
        let amount = worksheet.findCell(rowNumber, 4).value;
        let transaction = worksheet.findCell(rowNumber, 2).value;
        if (opt == '1') {
            generate(token, amount, transaction)
        }
        else if (opt == '2') {
            if (token == inputtoken) {
                generate(token, amount, transaction)
            }

        }
        else if (opt == '3') {

            if (timespan == inputdate) {
                generate(token, amount, transaction)
            }

        }
        else if (opt == '4') {

            if (timespan == inputdate && token == inputtoken) {
                generate(token, amount, transaction)
            }

        }


    });

    delete result.token;
    const portfolio = Object.fromEntries(
        Object.entries(result).map(([name, value]) => [name, value * val.USD])
    );
    return portfolio;
}

function generate(token, amount, transaction) {
    if (!(token in result)) {
        result[token] = transaction == 'DEPOSIT' ? amount * (1) : amount * (-1)
    }
    else {
        result[token] = transaction == 'DEPOSIT' ? result[token] + amount : result[token] - amount
    }
    return result;
}


