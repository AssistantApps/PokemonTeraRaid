const path = require('path');
const fs = require('fs');

const capitalizeFirstLetter = (orig) => {
    if (orig.length == 0) return orig;
    return [orig[0].toUpperCase(), ...orig.slice(1, orig.length)].join('');
}

const serebiiTeraRaidPokemon = () => {
    const rawdata = fs.readFileSync(path.join(__dirname, './serebiiTeraRaidPokemon.json'));
    const data = JSON.parse(rawdata);
    return data.names;
}

const victoryRoadvgcPokemon = () => {
    const rawdata = fs.readFileSync(path.join(__dirname, './victoryRoadvgcPokemon.json'));
    const data = JSON.parse(rawdata);
    return data.names;
}

const joinPokemonDataIntoOneFile = () => {
    const pokemonRelativeFolder = '../public/assets/ignore/api-data-master/data/api/v2/pokemon';
    const directoryPath = path.join(__dirname, pokemonRelativeFolder);
    const filesAndFolders = fs.readdirSync(directoryPath, { withFileTypes: true });

    const pokemonLookup = [];
    for (const fileOrDir of filesAndFolders) {
        if (fileOrDir.isDirectory() == false) {
            continue;
        }

        const rawdata = fs.readFileSync(path.join(__dirname, `${pokemonRelativeFolder}/${fileOrDir.name}/index.json`));
        const pokeDetails = JSON.parse(rawdata);

        if (pokeDetails.name.includes('-mega')) continue;

        const imgOpts = [
            pokeDetails.sprites.other['official-artwork'].front_default,
            pokeDetails.sprites.other.dream_world.front_default,
            pokeDetails.sprites.other.home.front_default,
            pokeDetails.sprites.front_default,
        ];
        pokemonLookup.push({
            title: capitalizeFirstLetter(pokeDetails.name),
            value: pokeDetails.name,
            image: imgOpts.filter(i => i != null)[0],
        });
    }

    const orderedPokemon = pokemonLookup.sort((a, b) => (a.title > b.title) ? 1 : -1);

    const filteredPokemon = [];
    const teraRaidPokemon = serebiiTeraRaidPokemon();
    for (const pokemon of orderedPokemon) {
        if (teraRaidPokemon.includes(pokemon.title)) {
            filteredPokemon.push(pokemon);
        }
    }

    const pokemonLookupJson = path.join(__dirname, '../public/assets/json/pokemon.json');
    const serebiiLookupJson = path.join(__dirname, '../public/assets/json/serebii.json');
    fs.writeFileSync(pokemonLookupJson, JSON.stringify(orderedPokemon, null, 2));
    fs.writeFileSync(serebiiLookupJson, JSON.stringify(filteredPokemon, null, 2));
}

joinPokemonDataIntoOneFile();
