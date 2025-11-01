// to do:
// add weight to certain pairings and sort combos by total weight
// maybe change data structure of validPairings to make insertion into sorted structure more efficient

class Character{
    constructor(name, pairings){
        this.name = name;
        this.pairings = pairings;
        this.rivals = [];
        this.priority = 0;
    }
}

// initialize all characters, ordering rivals in pairings array by most to least wanted pairing
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
    const getRival = (charPairings, name) => 
        charPairings.find((character) => character.name == name); 
    
    if(currCharacterIndex >= Math.ceil(charactersPaired.length / 2) - 1){
        const currChar = charactersPaired[currCharacterIndex];
        
        if(currChar.rivals.length == 1){
            const currCharPairings = currChar.pairings;

            for(let i = 0; i < currCharPairings.length; ++i){
                const currRivalName = currCharPairings[i];

                //should add a check if currRival not in charactersPaired
                if(charactersPaired.findIndex((character) => character.name == currRivalName) > currCharacterIndex &&
                    getRival(charactersPaired, currRivalName).rivals.length == 1){                    
                        let newCharsPaired = JSON.parse(JSON.stringify(charactersPaired));
                        let currCharCopy = newCharsPaired[currCharacterIndex];
                        let currRivalCopy = getRival(newCharsPaired, currRivalName);
                        const currCharName = currCharCopy.name;

                        currCharCopy.rivals.push(currRivalName);
                        currCharCopy.priority += i;
                        currRivalCopy.rivals.push(currCharName);
                        currRivalCopy.priority += currRivalCopy.pairings.indexOf(currCharName);

                        let totalScore = 0;

                        for(const character of newCharsPaired)
                            totalScore += character.priority

                        validPairings.push({'score': totalScore, 'characters': newCharsPaired});
                }
            }
        }
    }
    else{
        let currChar = charactersPaired[currCharacterIndex];
        const currCharPairings = currChar.pairings;

        for(let i = 0; i < currCharPairings.length - 1; ++i){
            let currRivals = [];
            const firstRivalName = currCharPairings[i];

            if(getRival(charactersPaired, firstRivalName).rivals.length > 1)
                continue;
            
            currRivals[0] = (firstRivalName);

            for(let j = i + 1; j < currCharPairings.length; ++j){
                const secondRivalName = currCharPairings[j];

                if(getRival(charactersPaired, secondRivalName).rivals.length > 1)
                    continue;

                currRivals[1] = (secondRivalName)
                let newCharsPaired = JSON.parse(JSON.stringify(charactersPaired));
                let currCharCopy = newCharsPaired[currCharacterIndex];
                let currCharName = currCharCopy.name;
                let firstRivalCopy = getRival(newCharsPaired, firstRivalName);
                let secondRivalCopy = getRival(newCharsPaired, secondRivalName);
                
                currCharCopy.rivals = currRivals;
                firstRivalCopy.rivals.push(currCharName);
                secondRivalCopy.rivals.push(currCharName);

                currCharCopy.priority = i + j;
                firstRivalCopy.priority += firstRivalCopy.pairings.indexOf(currCharName);
                secondRivalCopy.priority += secondRivalCopy.pairings.indexOf(currCharName);

                findPairingCombos(newCharsPaired, validPairings, currCharacterIndex + 1);
            }            
        }
    }
}

let validPairings = [];
findPairingCombos([...characters], validPairings, 0)

validPairings.sort((a, b) => a.score - b.score);

for(let i = 0; i < validPairings.length && i < 20; ++i){
    const pairing = validPairings[i];
    console.log(`
Combo ${i + 1}: 
`);
    
    for(let character of pairing.characters)
        console.log(`${character.name}: ${character.rivals}
`);
    }
