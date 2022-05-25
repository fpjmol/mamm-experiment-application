module.exports = {
    initializeClassificationObject,
    getRandomElement
}

const constants = require('./constants')

function initializeClassificationObject() {
    return {
        current: null,
        finished: [],
        remaining: constants.MAMM_IMAGE_IDS
    }
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)]
}

// SUPPORTING FUNCTIONS ----------------------------------

function getRandomizedImageIDSet() { //Depricated to set experiment order
    available_image_ids = constants.MAMM_IMAGE_IDS;
    return shuffle(available_image_ids);
}

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}