class Character{
    constructor(name, pairings){
        this.name = name;
        this.pairings = pairings;
        this.rivals = [];
        this.priority = 0;
    }
}

// TODO: update characters data structure from array
// so that priority can be a property of characters
// instead of each individual character having their own priority
// that needs to be summed up at the end

// TODO: read and assign these values from a JSON file

// initialize all characters, ordering rivals in pairings array
// by most to least wanted pairing for that character
const characters = [
    new Character('Jay', ['Thea', 'Nadia', 'Calliope']),
    new Character('Flynn', ['Daisy', 'Thea', 'Nadia']),
    new Character('Tristan', ['Nadia', 'Juniper', 'Daisy', 'Casey', 'Calliope']),
    new Character('Jonah', ['Juniper', 'Nadia', 'Calliope', 'Thea']),
    new Character('Beau', ['Calliope', 'Daisy', 'Juniper', 'Nadia', 'Casey']),
    new Character('Casey', ['Tristan', 'Juniper', 'Daisy', 'Beau']),
    new Character('Nadia', ['Jonah', 'Tristan', 'Jay', 'Flynn', 'Beau']),
    new Character('Thea', ['Jay', 'Flynn', 'Jonah']),
    new Character('Daisy', ['Flynn', 'Beau', 'Tristan', 'Casey']),
    new Character('Calliope', ['Beau', 'Jonah', 'Tristan', 'Jay']),
    new Character('Juniper', ['Jonah', 'Beau', 'Tristan', 'Casey']),
]

function findPairingCombos(charactersPaired, validPairings, currCharacterIndex){
    // helper method to get Character by name from array of Characters
    const getRival = (charPairings, name) => 
        charPairings.find((character) => character.name == name); 
    
    // exit condition - all male characters have been covered, and algorithm is now on Casey
    if(currCharacterIndex >= Math.ceil(charactersPaired.length / 2) - 1){
        const currChar = charactersPaired[currCharacterIndex];
        
        // if Casey does not have exactly 1 male rival by this point,
        // current pairings combination will be invalid
        if(currChar.rivals.length == 1){
            const currCharPairings = currChar.pairings;

            // loop through potential rivals in Casey's pairings array
            for(let i = 0; i < currCharPairings.length; ++i){
                const currRivalName = currCharPairings[i];

                // all characters after Casey will be female
                // we only want to check female rivals since
                // all male characters will have already been covered by this point

                // if given rival does not have exactly 1 assigned rival of their own by this point
                // current pairings combination will be invalid
                if(charactersPaired.findIndex((character) => character.name == currRivalName) > currCharacterIndex &&
                    getRival(charactersPaired, currRivalName).rivals.length == 1){

                        // deep copy characters array so as to not affect other recursive threads  
                        const charactersPairedCopy = JSON.parse(JSON.stringify(charactersPaired));

                        const currCharCopy = charactersPairedCopy[currCharacterIndex];
                        const currRivalCopy = getRival(charactersPairedCopy, currRivalName);
                        const currCharName = currCharCopy.name;

                        // add current rival to Casey's assigned rivals, and vice versa
                        // and update total score to reflect ranking of the current pairing
                        currCharCopy.rivals.push(currRivalName);
                        currCharCopy.priority += i;
                        currRivalCopy.rivals.push(currCharName);
                        currRivalCopy.priority += currRivalCopy.pairings.indexOf(currCharName);

                        let totalScore = 0;

                        // sum up total score of current pairings combination
                        // by adding up priority for each assigned pairing per respective character
                        for(const character of charactersPairedCopy)
                            totalScore += character.priority

                        // add valid pairings combination to array of pairings combinations
                        // TODO: add a lock here to prevent race condition
                        validPairings.push({'score': totalScore, 'characters': charactersPairedCopy});
                }
            }
        }
    }
    else{
        const currChar = charactersPaired[currCharacterIndex];
        const currCharPairings = currChar.pairings;

        // find first rival to assign to current character
        // do not need to check if rivals have already been assigned
        // because this code block only applies to male characters
        // who cannot be assigned to each other
        // for the initial iteration of the game
        for(let i = 0; i < currCharPairings.length - 1; ++i){
            const currRivals = [];
            const firstRivalName = currCharPairings[i];

            // if current potential rival already has 2 assigned rivals,
            // skip and move onto next rival
            if(getRival(charactersPaired, firstRivalName).rivals.length > 1)
                continue;

            // find second rival to assign to current character
            for(let j = i + 1; j < currCharPairings.length; ++j){
                const secondRivalName = currCharPairings[j];

                // if current potential rival already has 2 assigned rivals,
                // skip and move onto next rival
                if(getRival(charactersPaired, secondRivalName).rivals.length > 1)
                    continue;

                // deep copy characters array so as to not affect other recursive threads  
                const charactersPairedCopy = JSON.parse(JSON.stringify(charactersPaired));

                const currCharCopy = charactersPairedCopy[currCharacterIndex];
                const currCharName = currCharCopy.name;
                const firstRivalCopy = getRival(charactersPairedCopy, firstRivalName);
                const secondRivalCopy = getRival(charactersPairedCopy, secondRivalName);
                
                // set current character's rivals to the current rivals
                currCharCopy.rivals = [firstRivalName, secondRivalName];

                // and vice versa
                firstRivalCopy.rivals.push(currCharName);
                secondRivalCopy.rivals.push(currCharName);

                // update pairings ranking for each character who just had new rivals assigned
                currCharCopy.priority = i + j;
                firstRivalCopy.priority += firstRivalCopy.pairings.indexOf(currCharName);
                secondRivalCopy.priority += secondRivalCopy.pairings.indexOf(currCharName);

                // find all combinations of pairings that include the above pairings
                findPairingCombos(charactersPairedCopy, validPairings, currCharacterIndex + 1);
            }
        }
    }
}

const validPairings = [];

// save all valid pairing combinations in validPairings array
findPairingCombos(characters, validPairings, 0)

// sort pairing combinations by total score,
// with the lowest score corresponding to the most desirable combination of pairings
// a perfect score would be 15
validPairings.sort((a, b) => a.score - b.score);

// print the top 20 pairing combinations
for(let i = 0; i < validPairings.length && i < 20; ++i){
    const pairing = validPairings[i];
    console.log(`
Combo ${i + 1}, Ranking ${pairing.score}: 
`);
    
    for(let character of pairing.characters)
        console.log(`${character.name}: ${character.rivals}
`);
    }
