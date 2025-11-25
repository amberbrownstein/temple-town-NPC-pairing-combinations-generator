import * as fs from 'fs';

class Character{
    constructor(name, pairings){
        this.name = name;
        this.pairings = pairings;
        this.rivals = [];
        this.priority = 0;
    }
}

// TODO: read and assign these values from a JSON file

// initialize all characters, ordering rivals in pairings array
// by most to least wanted pairing for that character
const characters = [
    new Character('Jay', ['Thea', 'Calliope', 'Juniper']),
    new Character('Flynn', ['Thea', 'Daisy', 'Nadia']),
    new Character('Tristan', ['Casey', 'Juniper', 'Nadia', 'Daisy', 'Calliope']),
    new Character('Jonah', ['Nadia', 'Juniper', 'Calliope', 'Thea']),
    new Character('Russ', ['Calliope', 'Daisy', 'Thea', 'Juniper', 'Nadia', 'Casey']),
    new Character('Casey', ['Juniper', 'Daisy', 'Tristan', 'Russ']),
    new Character('Nadia', ['Jonah', 'Tristan', 'Russ', 'Flynn']),
    new Character('Thea', ['Flynn', 'Jay', 'Russ', 'Jonah']),
    new Character('Daisy', ['Flynn', 'Casey', 'Russ', 'Tristan']),
    new Character('Calliope', ['Russ', 'Jonah', 'Jay', 'Tristan']),
    new Character('Juniper', ['Casey', 'Jonah', 'Tristan', 'Jay', 'Russ']),
]

// add must-have pairings
characters[1].rivals.push('Daisy', 'Thea');
characters[4].rivals.push('Calliope');
characters[7].rivals.push('Flynn');
characters[8].rivals.push('Flynn');
characters[9].rivals.push('Russ');

// determine all valid pairing combinations
// add rivals to rivals array for each character from copy of charactersArray array
// add copy of charactersArray array of characters with populated rivals array to validPairings array
function findPairingCombos(charactersArray, validPairings, currCharacterIndex){
    // helper method to get Character by name from array of Characters
    const getRival = (charPairings, name) => 
        charPairings.find((character) => character.name == name);

    // helper method to add a rival to a given character
    const updateCharsRivals = (characters, character, rivalName, rivalIndex) => {
        const charName = character.name;
        const rival = getRival(characters, rivalName);

        // add current rival to current character's rivals
        // and vice versa
        character.rivals.push(rivalName);
        rival.rivals.push(charName);

        // update pairings ranking for both
        character.priority += rivalIndex;
        rival.priority += rival.pairings.indexOf(charName);
    }

    const indexOfCasey = Math.ceil(charactersArray.length / 2) - 1;
    
    // exit condition - all male characters have been covered, and algorithm is now on Casey
    if(currCharacterIndex === indexOfCasey){
        const currChar = charactersArray[currCharacterIndex];
        
        // if Casey does not have exactly 1 male rival by this point,
        // current pairings combination will be invalid
        if(currChar.rivals.length === 1){
            const currCharPairings = currChar.pairings;

            // loop through potential rivals in Casey's pairings array
            for(let i = 0; i < currCharPairings.length; ++i){
                const currRivalName = currCharPairings[i];

                // all characters with an index after Casey's will be female
                // we only want to check female rivals since
                // all male characters will have already been covered by this point

                // if given rival does not have exactly 1 assigned rival of their own by this point
                // current pairings combination will be invalid
                if(charactersArray.findIndex((character) => character.name == currRivalName) > currCharacterIndex &&
                    getRival(charactersArray, currRivalName).rivals.length === 1){

                        // deep copy characters array so as to not affect other recursive threads  
                        const charactersArrayCopy = JSON.parse(JSON.stringify(charactersArray));

                        const currCharCopy = charactersArrayCopy[currCharacterIndex];
                        const currRivalCopy = getRival(charactersArrayCopy, currRivalName);
                        const currCharName = currCharCopy.name;

                        // add current rival to Casey's assigned rivals, and vice versa
                        // and update total score to reflect ranking of the current pairing
                        currCharCopy.rivals.push(currRivalName);
                        currCharCopy.priority += i;
                        currRivalCopy.rivals.push(currCharName);
                        currRivalCopy.priority += currRivalCopy.pairings.indexOf(currCharName);
                        
                        // check condition that there is no symmetry between any subset of characters 
                        // that would cause marrying a specific character to result in any NPC not being able to marry
                        // due to their alternate rival already marrying someone else

                        // check male characters
                        if(!checkForSymmetry(charactersArrayCopy.slice(0, indexOfCasey)))
                            return false;

                        // check female characters
                        if(!checkForSymmetry(charactersArrayCopy.slice(indexOfCasey + 1, charactersArrayCopy.length)))
                            return false;

                        let totalScore = 0;    

                        // TODO: update characters data structure from array
                        // so that priority can be a property of characters
                        // instead of each individual character having their own priority
                        // that needs to be summed up at the end
                    
                        // sum up total score of current pairings combination
                        // by adding up priority for each assigned pairing per respective character
                        for(const character of charactersArrayCopy)
                            totalScore += character.priority
                    
                        // TODO: add a lock here to prevent race condition

                        // add valid pairings combination to array of pairings combinations
                        validPairings.push({'score': totalScore, 'characters': charactersArrayCopy});
                }
            }
        }
    }
    else{
        const currChar = charactersArray[currCharacterIndex];
        const currCharPairings = currChar.pairings;

        // find first rival to assign to current character
        for(let i = 0; i < currCharPairings.length - 1; ++i){
            let firstRivalName;
            
            // assign first rival to current pairing
            // if first rival is already filled, leave firstRivalName undefined
            if(currChar.rivals.length === 0){
                firstRivalName = currCharPairings[i];
                
                // if current potential rival already has 2 assigned rivals,
                // skip and move onto next rival
                if(getRival(charactersArray, firstRivalName).rivals.length > 1)
                    continue;
            }

            // find second rival to assign to current character
            for(let j = i + 1; j < currCharPairings.length; ++j){

                // deep copy characters array so as to not affect other recursive threads  
                const charactersArrayCopy = JSON.parse(JSON.stringify(charactersArray));

                // if current character already has 2 rivals assigned,
                // skip straight to recursing through the next characters
                if(currChar.rivals.length === 2){
                    findPairingCombos(charactersArrayCopy, validPairings, currCharacterIndex + 1);
                    break;
                }
                else{
                    const secondRivalName = currCharPairings[j];
                        
                    // if current potential rival already has 2 assigned rivals,
                    // skip and move onto next rival
                    if(getRival(charactersArray, secondRivalName).rivals.length > 1)
                        continue;

                    const currCharCopy = charactersArrayCopy[currCharacterIndex];

                    // if first rival hasn't been assigned yet
                    // set first rival to current first rival from outer loop
                    if(firstRivalName){
                        updateCharsRivals(charactersArrayCopy, currCharCopy, firstRivalName, i);
                    }

                    updateCharsRivals(charactersArrayCopy, currCharCopy, secondRivalName, j);

                    // find all valid combinations of rival assignments for the remaining characters
                    // given the rival assignments that have already been set for the previously covered characters
                    findPairingCombos(charactersArrayCopy, validPairings, currCharacterIndex + 1);
                }
            }

            // no need to continue outer loop if first rival had already been assigned
            if(!firstRivalName)
                break;
        }
    }
}

// function to check that there is no marriage candidate
// for whom marrying would result in any NPC being unable to get married
function checkForSymmetry(charactersArray) {
    let validCombo = true;

    function help(curr, remain) {
        if(!validCombo)
            return;

        if (remain.length === 0) {
            if (curr.length > 1) {
                const uniqueRivals = curr.reduce(
                    (setOfRivals, character) => {
                        for(const rival of character.rivals)
                            setOfRivals.add(rival);

                        return setOfRivals;
                    },
                    new Set()
                );

                // if the number of unique assigned rivals is equal to the number of
                // characters being compared, then marrying one of those rivals
                // will cause one character to be unable to get married
                if(uniqueRivals.size === curr.length)
                    validCombo = false;
            }
            return;
        }

        // recursively check each subset of the currently assigned character pairings
        help([...curr, remain[0]], remain.slice(1));

        help(curr, remain.slice(1));
    }

    help([], charactersArray);
    return validCombo;
}

const validPairings = [];

// save all valid pairing combinations in validPairings array
findPairingCombos(characters, validPairings, 0)

// sort pairing combinations by total score,
// with the lowest score corresponding to the most desirable combination of pairings
// a perfect score would be 15
validPairings.sort((a, b) => a.score - b.score);

// reduce to top 20 combinations
validPairings.splice(20);

let data = '';
let lowestRanking = -1;

// print generated combos to text file
for(let i = 0; i < validPairings.length; ++i){
    const pairing = validPairings[i];
    let ranking = pairing.score;

    if(i == 0)
        lowestRanking += ranking;
    
    ranking -= lowestRanking;

    data += `
Combo ${i + 1}, Ranking ${ranking}: 
`;
    
    for(let character of pairing.characters)
        data += `${character.name}: ${character.rivals.join(', ')}
`;
    }

    fs.writeFile('pairsRanked.txt', data, (err) => { if (err) { console.error('An error occurred:', err); return; }
        console.log('Data has been written to pairsRanked.txt'); });