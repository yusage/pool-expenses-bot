const fs = require('fs');

async function saveToCSV(array, file) {
    // choose another string to temporally replace commas if necessary
    let stringToReplaceComas = '@#@##';

    // console.log('0: ', array, '\n');

    array.map((singleRow) => {
        singleRow.map((value, index) => {
            singleRow[index] = value.replace(/,/g, stringToReplaceComas);
            singleRow[index] = singleRow[index].replace(/"/g, '""');
            if (singleRow[index].includes(';') || singleRow[index].includes('"')) {
                singleRow[index] = `"${singleRow[index]}"`;
            }
        });
    });

    // console.log('1: ', array, '\n');

    let csv = `${array.join('\n').replace(/,/g, ';').replace(new RegExp(`${stringToReplaceComas}`, 'g'), ',')}`;

    // console.log('4: ', csv, '\n');
    try {
        await fs.writeFile(file, '\ufeff' + csv, { encoding: 'utf8' }, () => {});
        return {
            result: true,
            file,
        };
    } catch (error) {
        return {
            result: false,
            error,
        };
    }
}

module.exports = saveToCSV;