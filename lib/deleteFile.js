const fs = require('fs');
const path = require('path');


exports.deleteFile = (filename) => {
    // Specify the path to the file you want to delete
    const filePath = path.join(__dirname, 'uploads', filename);

    // Use fs.unlink to delete the file
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        } else {
            console.log('File deleted successfully');
        }
    });
};

