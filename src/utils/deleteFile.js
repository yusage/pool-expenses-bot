const fs = require('fs');

function deleteFile(file) {
    try {
        fs.unlinkSync(file);
        return {
            result: true,
            file,
        };
    } catch (error) {
        console.log(`! Error: Cannot delete file !\n${error.message}`);
        return {
            result: false,
            error
        };
    }
}

module.exports = deleteFile;